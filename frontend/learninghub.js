// learninghub.js
// Connects frontend Learning Hub to backend for modules, lessons, and quizzes


document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const readTab = document.querySelector("[x-show=\"tab === 'read'\"]");
    const quizTab = document.querySelector("[x-show=\"tab === 'quiz'\"]");
    const gameTab = document.querySelector("[x-show=\"tab === 'game'\"]");

    // Load modules for Read tab
    fetch('http://localhost:4000/api/learning/modules')
        .then(res => res.json())
        .then(modules => {
            if (!Array.isArray(modules)) return;
            if (readTab) {
                const readingSection = readTab.querySelector('.glass:last-child');
                readTab.innerHTML = modules.map(module => `
                    <div class="glass p-6 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center mb-2">
                                <span class="inline-block bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold mr-2">${module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}</span>
                                <span class="text-gray-400 text-xs">Module</span>
                            </div>
                            <h2 class="text-2xl font-bold mb-2">${module.title}</h2>
                            <p class="text-gray-300 mb-4">${module.description}</p>
                        </div>
                        <a href="#" class="mt-4 inline-block bg-purple-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-purple-700 transition">Start Learning</a>
                    </div>
                `).join('') + (readingSection ? readingSection.outerHTML : '');
            }
        });

    // Render quizzes with fallback if none
    fetch('http://localhost:4000/api/learning/quizzes')
        .then(res => res.json())
        .then(data => {
            if (quizTab) {
                if (!data.quizzes || !Array.isArray(data.quizzes) || data.quizzes.length === 0) {
                    quizTab.innerHTML = `<div class="glass p-6 text-center">No quizzes available at the moment. Please check back later!</div>`;
                } else {
                    quizTab.innerHTML = data.quizzes.map(quiz => `
                        <div class="glass p-6 flex flex-col justify-between">
                            <div>
                                <h2 class="text-2xl font-bold mb-2">${quiz.title}</h2>
                                <p class="text-gray-300 mb-4">${quiz.description}</p>
                            </div>
                            <button class="mt-4 inline-block bg-purple-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-purple-700 transition take-quiz-btn" data-quiz='${JSON.stringify(quiz)}'>Take Quiz</button>
                        </div>
                    `).join('');
                    setupQuizModal(data.quizzes);
                }
            }
        });

    // Dynamically load phishing-game.js and set up tab switching
    let phishingGameLoaded = false;
    function renderGameTab() {
        if (typeof window.renderPhishingGame === 'function' && gameTab) {
            window.renderPhishingGame(gameTab);
        }
    }

    // Listen for tab switches using event delegation (Alpine.js doesn't fire JS events)
    const tabButtons = document.querySelectorAll('button');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.textContent.trim().toLowerCase() === 'games') {
                if (phishingGameLoaded) {
                    renderGameTab();
                }
            }
        });
    });

    // Load phishing-game.js once
    if (!phishingGameLoaded) {
        const script = document.createElement('script');
        script.src = 'phishing-game.js';
        script.onload = () => {
            phishingGameLoaded = true;
            // If Games tab is visible on load, render immediately
            if (gameTab && gameTab.offsetParent !== null) {
                renderGameTab();
            }
        };
        document.body.appendChild(script);
    }
});

// Example quiz starter (expand as needed)

// Interactive quiz modal logic
function setupQuizModal(quizzes) {
    let quizContainer = document.getElementById('quiz-modal');
    if (!quizContainer) {
        quizContainer = document.createElement('div');
        quizContainer.id = 'quiz-modal';
        quizContainer.style.display = 'none';
        quizContainer.style.position = 'fixed';
        quizContainer.style.top = '0';
        quizContainer.style.left = '0';
        quizContainer.style.width = '100vw';
        quizContainer.style.height = '100vh';
        quizContainer.style.background = 'rgba(30, 27, 75, 0.95)';
        quizContainer.style.zIndex = '1000';
        quizContainer.style.justifyContent = 'center';
        quizContainer.style.alignItems = 'center';
        quizContainer.innerHTML = '<div id="quiz-content" style="max-width:400px;margin:auto;background:#18122B;padding:2rem;border-radius:1rem;color:#fff;box-shadow:0 8px 32px 0 rgba(31,38,135,0.37);"></div>';
        document.body.appendChild(quizContainer);
    }

    document.querySelectorAll('.take-quiz-btn').forEach(btn => {
        btn.onclick = function () {
            const quiz = JSON.parse(btn.getAttribute('data-quiz'));
            // If quiz.questions exists, use it, else fallback to mock
            let questions = quiz.questions || [
                {
                    question: "Which of the following is a sign of a phishing email?",
                    options: [
                        "Unexpected attachment",
                        "Personalized greeting",
                        "Email from your boss",
                        "No spelling mistakes"
                    ],
                    answer: 0
                },
                {
                    question: "What should you do if you suspect a phishing email?",
                    options: [
                        "Click the link to check",
                        "Reply and ask for details",
                        "Report it to IT/security",
                        "Forward to a friend"
                    ],
                    answer: 2
                }
            ];
            showQuiz(questions);
        };
    });

    function showQuiz(quiz) {
        let current = 0;
        let score = 0;
        renderQuestion();
        quizContainer.style.display = 'flex';

        function renderQuestion() {
            const q = quiz[current];
            let html = `<h2 style="font-size:1.5rem;margin-bottom:1rem;">${q.question}</h2>`;
            q.options.forEach((opt, idx) => {
                html += `<button class="quiz-option" style="display:block;width:100%;margin-bottom:0.5rem;padding:0.75rem;border-radius:0.5rem;background:#6D28D9;color:#fff;border:none;font-size:1rem;cursor:pointer;" data-idx="${idx}">${opt}</button>`;
            });
            html += `<button id="close-quiz" style="margin-top:1rem;background:#A78BFA;color:#18122B;padding:0.5rem 1rem;border-radius:0.5rem;border:none;cursor:pointer;">Close</button>`;
            document.getElementById('quiz-content').innerHTML = html;

            document.querySelectorAll('.quiz-option').forEach(btn => {
                btn.onclick = function () {
                    if (parseInt(btn.dataset.idx) === q.answer) score++;
                    current++;
                    if (current < quiz.length) {
                        renderQuestion();
                    } else {
                        showResult();
                    }
                };
            });

            document.getElementById('close-quiz').onclick = function () {
                quizContainer.style.display = 'none';
            };
        }

        function showResult() {
            document.getElementById('quiz-content').innerHTML =
                `<h2 style="font-size:1.5rem;margin-bottom:1rem;">Quiz Complete!</h2>
                <p style="font-size:1.2rem;margin-bottom:1rem;">Your score: <b>${score} / ${quiz.length}</b></p>
                <button id="close-quiz" style="background:#A78BFA;color:#18122B;padding:0.5rem 1rem;border-radius:0.5rem;border:none;cursor:pointer;">Close</button>`;
            document.getElementById('close-quiz').onclick = function () {
                quizContainer.style.display = 'none';
            };
        }
    }
}
