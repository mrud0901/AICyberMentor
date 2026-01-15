require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- AI Setup ---
// Load the API key from the environment variable (the safe way)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Check if the API key is available
if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable not set.");
  process.exit(1); // Stop the application if the key is missing
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Create the AI model
// Using gemini-2.5-flash - a fast, efficient model
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
// --- End AI Setup ---

// --- Database Setup ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'aicybermentor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me';


// --- Express App Setup ---
const app = express();
const port = process.env.PORT || 8000; // Use port 8000 to match Python

// Add CORS middleware - Allow all origins for development
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add middleware to parse JSON request bodies
app.use(express.json());

// --- API Endpoints ---

app.get('/', (req, res) => {
  res.json({ message: 'AI Cybersecurity Mentor API is running!' });
});


app.get('/api/test', (req, res) => {
  res.json({ message: 'Success! Frontend is connected to Node.js! 🎉' });
});

// --- AUTH ENDPOINTS ---
// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if user already exists
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
      [fullName, email, hashedPassword]
    );

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = users[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get current user endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    const [users] = await pool.query('SELECT id, full_name, email FROM users WHERE id = ?', [decoded.userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        id: users[0].id,
        fullName: users[0].full_name,
        email: users[0].email
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
});

// --- AI CHAT ENDPOINT ---
app.post('/api/chat', async (req, res) => {
  try {
    // Get the prompt from the request body
    const { prompt, system_prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // Get user ID from token (optional - if not authenticated, just return response without saving)
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Token invalid, continue without user ID
        console.log('Invalid token in chat request, proceeding without saving history');
      }
    }

    // This is the "system prompt" or "persona" for your chatbot
    let systemPromptText = system_prompt || `You are 'CyberMentor,' a friendly and patient cybersecurity expert. Your goal is to teach users complex topics (like 2FA, phishing, malware) in simple, easy-to-understand terms. Never give harmful advice. Keep your answers concise and helpful.`;

    // Use gemini-2.5-flash which is available with our API key
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Combine system prompt with user prompt
    const fullPrompt = `${systemPromptText}\n\nUser question: ${prompt}`;

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Save to chat history if user is authenticated
    if (userId) {
      try {
        await pool.query(
          'INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)',
          [userId, prompt, text]
        );
      } catch (dbError) {
        console.error('Error saving chat history:', dbError);
        // Continue even if saving fails
      }
    }

    // Return the AI's text response
    res.json({ response: text });

  } catch (e) {
    console.error(`Error calling Gemini API: ${e}`);
    res.status(500).json({ error: `An error occurred with the AI service: ${e.message}` });
  }
});

// --- CHAT HISTORY ENDPOINTS ---
// Get chat history for logged-in user
app.get('/api/chat/history', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Get last 50 chat messages
    const [history] = await pool.query(
      'SELECT id, message, response, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    res.json({ history: history.reverse() }); // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
});

// Delete chat history for logged-in user
app.delete('/api/chat/history', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    await pool.query('DELETE FROM chat_history WHERE user_id = ?', [userId]);

    res.json({ message: 'Chat history deleted successfully.' });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    res.status(500).json({ error: 'Failed to delete chat history.' });
  }
});


// Delete specific chat message
app.delete('/api/chat/history/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const messageId = req.params.id;

    // Make sure the message belongs to the user
    await pool.query('DELETE FROM chat_history WHERE id = ? AND user_id = ?', [messageId, userId]);

    res.json({ message: 'Chat message deleted successfully.' });
  } catch (error) {
    console.error('Error deleting chat message:', error);
    res.status(500).json({ error: 'Failed to delete chat message.' });
  }
});

// --- LEARNING SYSTEM ENDPOINTS ---

// 1. GET /api/learning/modules (Public)
app.get('/api/learning/modules', async (req, res) => {
  try {
    const [modules] = await pool.query(
      'SELECT id, title, description, icon, difficulty, order_index FROM learning_modules ORDER BY order_index ASC'
    );
    res.status(200).json(modules);
  } catch (error) {
    console.error('Error fetching learning modules:', error);
    res.status(500).json({ error: 'Failed to fetch learning modules.' });
  }
});

// 2. GET /api/learning/modules/:id/lessons (Public)
app.get('/api/learning/modules/:id/lessons', async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id, 10);
    if (isNaN(moduleId)) {
      return res.status(400).json({ error: 'Invalid module ID.' });
    }
    const [lessons] = await pool.query(
      'SELECT id, module_id, title, content, type, order_index, duration_minutes FROM lessons WHERE module_id = ? ORDER BY order_index ASC',
      [moduleId]
    );
    if (!lessons || lessons.length === 0) {
      return res.status(404).json({ error: 'Module not found or has no lessons.' });
    }
    res.status(200).json({ moduleId, lessons });
  } catch (error) {
    console.error('Error fetching lessons for module:', error);
    res.status(500).json({ error: 'Failed to fetch lessons.' });
  }
});

// 3. GET /api/learning/progress (Authenticated)
app.get('/api/learning/progress', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }
    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    const userId = decoded.userId;
    const [progress] = await pool.query(
      `SELECT up.*, l.title AS lesson_title, l.module_id
       FROM user_progress up
       JOIN lessons l ON up.lesson_id = l.id
       WHERE up.user_id = ?
       ORDER BY up.updated_at DESC`,
      [userId]
    );
    res.status(200).json({ progress });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress.' });
  }
});

// 4. POST /api/learning/progress (Authenticated)
// --- QUIZZES ENDPOINTS (Mock) ---

// GET /api/learning/quizzes (Public, mock data)
app.get('/api/learning/quizzes', (req, res) => {
  // Example quiz data
  const quizzes = [
    {
      id: 1,
      title: 'Phishing Awareness Quiz',
      description: 'Test your ability to spot phishing attempts.',
      questions: [
        {
          id: 101,
          question: 'Which of the following is a sign of a phishing email?',
          options: [
            'Unexpected attachment',
            'Personalized greeting',
            'Email from your boss',
            'No spelling mistakes'
          ],
          answer: 0
        },
        {
          id: 102,
          question: 'What should you do if you suspect a phishing email?',
          options: [
            'Click the link to check',
            'Reply and ask for details',
            'Report it to IT/security',
            'Forward to a friend'
          ],
          answer: 2
        }
      ]
    }
  ];
  res.json({ quizzes });
});

// POST /api/learning/quizzes/:id/submit (Authenticated, mock scoring)
app.post('/api/learning/quizzes/:id/submit', (req, res) => {
  // In a real app, validate JWT and store results per user
  const { answers } = req.body;
  // Mock quiz answers for quiz id 1
  const correctAnswers = [0, 2];
  let score = 0;
  if (Array.isArray(answers)) {
    answers.forEach((ans, idx) => {
      if (ans === correctAnswers[idx]) score++;
    });
  }
  res.json({ score, total: correctAnswers.length, message: `You scored ${score} out of ${correctAnswers.length}` });
});
app.post('/api/learning/progress', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }
    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    const userId = decoded.userId;
    const { lessonId, completed, score } = req.body;
    if (!lessonId) {
      return res.status(400).json({ error: 'lessonId is required.' });
    }
    let completedVal = !!completed;
    let scoreVal = null;
    if (score !== undefined && score !== null) {
      if (typeof score !== 'number' || score < 0 || score > 100) {
        return res.status(400).json({ error: 'Score must be a number between 0 and 100.' });
      }
      scoreVal = score;
    }
    // Upsert progress
    const [result] = await pool.query(
      `INSERT INTO user_progress (user_id, lesson_id, completed, score, completed_at)
       VALUES (?, ?, ?, ?, IF(? = TRUE, CURRENT_TIMESTAMP, NULL))
       ON DUPLICATE KEY UPDATE
         completed = VALUES(completed),
         score = VALUES(score),
         completed_at = IF(VALUES(completed) = TRUE, CURRENT_TIMESTAMP, NULL),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, lessonId, completedVal, scoreVal, completedVal]
    );
    // Fetch the updated record
    const [updated] = await pool.query(
      `SELECT up.*, l.title AS lesson_title, l.module_id
       FROM user_progress up
       JOIN lessons l ON up.lesson_id = l.id
       WHERE up.user_id = ? AND up.lesson_id = ?`,
      [userId, lessonId]
    );
    res.status(200).json({ message: 'Progress updated successfully.', progress: updated[0] });
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({ error: 'Failed to update user progress.' });
  }
});

// --- Start the Server ---
// --- DATA BREACH CHECK MOCK ENDPOINTS ---
// Email Breach Check
app.post('/api/check-email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  console.log(`🔍 Mock checking email: ${email}`);
  if (email.toLowerCase() === 'breached@example.com') {
    setTimeout(() => {
      res.json({
        isPwned: true,
        breachCount: 3,
        message: 'Oh no! Data breaches found.',
        breaches: [
          { Name: 'Adobe', Domain: 'adobe.com', Date: '2013-10-04', DataClasses: ['Email', 'Password Hint', 'Password'] },
          { Name: 'LinkedIn', Domain: 'linkedin.com', Date: '2012-05-05', DataClasses: ['Email', 'Password'] },
          { Name: 'Canva', Domain: 'canva.com', Date: '2019-05-24', DataClasses: ['Email', 'Name', 'City'] }
        ]
      });
    }, 1500);
  } else {
    setTimeout(() => {
      res.json({
        isPwned: false,
        breachCount: 0,
        message: 'Good news! No breaches found.',
        breaches: []
      });
    }, 1000);
  }
});

// Phone Breach Check
app.post('/api/check-phone', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required.' });
  console.log(`🔍 Mock checking phone: ${phone}`);
  if (phone === '+15550000000') {
    setTimeout(() => {
      res.json({
        isPwned: true,
        breachCount: 1,
        message: 'Warning: Number found in data breach.',
        breaches: [
          { Name: 'Facebook', Domain: 'facebook.com', Date: '2019-08-30', DataClasses: ['Phone Number', 'Name', 'Location'] }
        ]
      });
    }, 1500);
  } else {
    setTimeout(() => {
      res.json({
        isPwned: false,
        breachCount: 0,
        message: 'Safe: Number not found in known breaches.',
        breaches: []
      });
    }, 1000);
  }
});

// --- DATA BREACH CHECK MOCK ENDPOINTS ---
// Check Email Breach
app.post('/api/check-email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  console.log(`🔍 Mock checking email: ${email}`);
  if (email.toLowerCase() === 'breached@example.com') {
    setTimeout(() => {
      res.json({
        isPwned: true,
        breachCount: 3,
        message: "Oh no! Data breaches found.",
        breaches: [
          { Name: "Adobe", Domain: "adobe.com", Date: "2013-10-04", DataClasses: ["Email", "Password Hint", "Password"] },
          { Name: "LinkedIn", Domain: "linkedin.com", Date: "2012-05-05", DataClasses: ["Email", "Password"] },
          { Name: "Canva", Domain: "canva.com", Date: "2019-05-24", DataClasses: ["Email", "Name", "City"] }
        ]
      });
    }, 1500);
  } else {
    setTimeout(() => {
      res.json({
        isPwned: false,
        breachCount: 0,
        message: "Good news! No breaches found.",
        breaches: []
      });
    }, 1000);
  }
});

// Check Phone Breach
app.post('/api/check-phone', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required.' });
  console.log(`🔍 Mock checking phone: ${phone}`);
  if (phone === '+15550000000') {
    setTimeout(() => {
      res.json({
        isPwned: true,
        breachCount: 1,
        message: "Warning: Number found in data breach.",
        breaches: [
          { Name: "Facebook", Domain: "facebook.com", Date: "2019-08-30", DataClasses: ["Phone Number", "Name", "Location"] }
        ]
      });
    }, 1500);
  } else {
    setTimeout(() => {
      res.json({
        isPwned: false,
        breachCount: 0,
        message: "Safe: Number not found in known breaches.",
        breaches: []
      });
    }, 1000);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  if (!GEMINI_API_KEY) {
    console.warn("Warning: GEMINI_API_KEY is not set. /api/chat endpoint will fail.");
  }
});
