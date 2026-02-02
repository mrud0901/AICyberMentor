document.addEventListener('DOMContentLoaded', () => {

    /* =========================
       CONFIG
    ========================= */
    const API_BASE_URL = "https://ai-cyber-mentor.vercel.app";
    const token = localStorage.getItem('authToken');

    /* =========================
       DOM ELEMENTS
    ========================= */
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const sendButton = document.getElementById('send-button');

    const sidebar = document.getElementById('history-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const newChatBtn = document.getElementById('new-chat-btn');

    /* =========================
       SIDEBAR CONTROLS
    ========================= */
    sidebarToggle?.addEventListener('click', () => sidebar.classList.add('open'));
    sidebarClose?.addEventListener('click', () => sidebar.classList.remove('open'));

    document.addEventListener('click', (e) => {
        if (
            window.innerWidth < 768 &&
            !sidebar.contains(e.target) &&
            !sidebarToggle.contains(e.target) &&
            sidebar.classList.contains('open')
        ) {
            sidebar.classList.remove('open');
        }
    });

    newChatBtn?.addEventListener('click', startNewChat);

    /* =========================
       INIT LOAD
    ========================= */
    loadChatHistory();
    loadHistorySidebar();

    /* =========================
       CHAT SUBMIT
    ========================= */
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        userInput.disabled = true;
        sendButton.disabled = true;

        appendMessage(userMessage, 'user');
        userInput.value = '';
        showTypingIndicator();

        try {
            const aiResponse = await getAIResponse(userMessage);
            removeTypingIndicator();
            appendMessage(aiResponse, 'ai');
            if (token) loadHistorySidebar();
        } catch (err) {
            console.error(err);
            removeTypingIndicator();
            appendMessage('Sorry, something went wrong.', 'ai-error');
        } finally {
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    });

    /* =========================
       API FUNCTIONS
    ========================= */
    async function getAIResponse(userMessage) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ prompt: userMessage })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'AI request failed');
        }

        const data = await response.json();
        return data.response;
    }

    async function loadChatHistory() {
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/chat/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error();

            const data = await res.json();
            chatBox.innerHTML = '';
            if (data.history.length === 0) return showWelcomeMessage();

            data.history.forEach(chat => {
                appendMessage(chat.message, 'user', false, chat.created_at);
                appendMessage(chat.response, 'ai', false, chat.created_at);
            });
        } catch {
            showWelcomeMessage();
        }
    }

    async function loadHistorySidebar() {
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/chat/history`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return;
        const data = await res.json();

        const historyList = document.getElementById('history-list');
        const countEl = document.getElementById('history-count');
        countEl.textContent = data.history.length;

        historyList.innerHTML = '';
        data.history.forEach(chat => historyList.appendChild(createChatHistoryItem(chat)));
    }

    /* =========================
       DELETE / CLEAR
    ========================= */
    window.deleteChat = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Delete this chat?')) return;

        await fetch(`${API_BASE_URL}/api/chat/history/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        loadHistorySidebar();
        startNewChat();
    };

    window.clearAllHistory = async () => {
        if (!confirm('Clear all history?')) return;

        await fetch(`${API_BASE_URL}/api/chat/history`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        startNewChat();
        loadHistorySidebar();
    };

    /* =========================
       UI HELPERS (UNCHANGED)
    ========================= */
    function appendMessage() { /* your existing code */ }
    function showTypingIndicator() { /* unchanged */ }
    function removeTypingIndicator() { /* unchanged */ }
    function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }
    function formatMessage(text) { return escapeHtml(text).replace(/\n/g, '<br>'); }

    function showWelcomeMessage() {
        chatBox.innerHTML = `<p>👋 Hello! I’m your AI Security Mentor.</p>`;
    }

    function startNewChat() {
        chatBox.innerHTML = '';
        showWelcomeMessage();
    }

    function createChatHistoryItem(chat) {
        const div = document.createElement('div');
        div.textContent = chat.message.slice(0, 50);
        div.onclick = () => loadSpecificChat(chat);
        return div;
    }

    function loadSpecificChat(chat) {
        chatBox.innerHTML = '';
        appendMessage(chat.message, 'user');
        appendMessage(chat.response, 'ai');
    }
});
