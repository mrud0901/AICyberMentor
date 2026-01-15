// phishing-game.js
// Simple phishing spotter game for the Learning Hub


// Exported function to render the phishing game in the provided container
window.renderPhishingGame = function(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="glass p-6 flex flex-col justify-between">
            <h2 class="text-2xl font-bold mb-4">Phishing Spotter Mini-Game</h2>
            <p class="text-gray-300 mb-4">Is this email safe or a phishing attempt? Click the correct button for each example!</p>
            <div id="phishing-question" class="mb-6 text-lg font-semibold text-white"></div>
            <div class="flex space-x-4 mb-6">
                <button id="btn-safe" class="bg-green-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-green-700 transition">Safe</button>
                <button id="btn-phish" class="bg-rose-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-rose-700 transition">Phishing</button>
            </div>
            <div id="phishing-feedback" class="text-lg font-bold"></div>
        </div>
    `;
    const questions = [
        { text: 'Subject: "Update your password immediately! Click here: http://bit.ly/secure-login"', answer: 'phish' },
        { text: 'Subject: "Your Amazon order has shipped. Track it in your account."', answer: 'safe' },
        { text: 'Subject: "We noticed suspicious activity. Log in at http://security-check.com"', answer: 'phish' },
        { text: 'Subject: "Welcome to your new job! Here are your onboarding documents."', answer: 'safe' }
    ];
    let current = 0;
    let score = 0;
    const questionDiv = container.querySelector('#phishing-question');
    const feedbackDiv = container.querySelector('#phishing-feedback');
    const btnSafe = container.querySelector('#btn-safe');
    const btnPhish = container.querySelector('#btn-phish');

    function showQuestion() {
        if (current < questions.length) {
            questionDiv.textContent = questions[current].text;
            feedbackDiv.textContent = '';
        } else {
            questionDiv.textContent = '';
            feedbackDiv.innerHTML = `<span class='text-green-400'>Game Over! Your score: ${score} / ${questions.length}</span>`;
            btnSafe.disabled = true;
            btnPhish.disabled = true;
        }
    }
    btnSafe.onclick = () => {
        if (questions[current].answer === 'safe') {
            score++;
            feedbackDiv.textContent = 'Correct!';
            feedbackDiv.className = 'text-green-400 font-bold';
        } else {
            feedbackDiv.textContent = 'Oops! That was a phishing attempt.';
            feedbackDiv.className = 'text-rose-400 font-bold';
        }
        current++;
        setTimeout(showQuestion, 1000);
    };
    btnPhish.onclick = () => {
        if (questions[current].answer === 'phish') {
            score++;
            feedbackDiv.textContent = 'Correct!';
            feedbackDiv.className = 'text-green-400 font-bold';
        } else {
            feedbackDiv.textContent = 'Oops! That was a safe email.';
            feedbackDiv.className = 'text-rose-400 font-bold';
        }
        current++;
        setTimeout(showQuestion, 1000);
    };
    showQuestion();
};
