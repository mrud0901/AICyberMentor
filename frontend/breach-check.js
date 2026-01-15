// breach-check.js
// Handles Data Breach Check UI and API calls for email and phone

document.addEventListener('DOMContentLoaded', () => {
    // Attach to all pages with the breach check form
    const breachForm = document.getElementById('breach-check-form');
    if (!breachForm) return;

    const emailInput = document.getElementById('breach-email');
    const phoneInput = document.getElementById('breach-phone');
    const resultBox = document.getElementById('breach-result');
    const submitBtn = document.getElementById('breach-submit');

    breachForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        resultBox.innerHTML = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Checking...';

        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        let endpoint = '';
        let payload = {};
        if (email) {
            endpoint = '/api/check-email';
            payload = { email };
        } else if (phone) {
            endpoint = '/api/check-phone';
            payload = { phone };
        } else {
            resultBox.innerHTML = '<div class="text-red-600">Please enter an email or phone number.</div>';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Check Now';
            return;
        }

        try {
            const res = await fetch(`http://localhost:4000${endpoint}` , {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                if (data.isPwned) {
                    resultBox.innerHTML = `
                        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-2">
                            <h4 class="font-bold text-red-700 dark:text-red-300 mb-2">⚠️ Breach Found!</h4>
                            <p class="mb-2">${data.message}</p>
                            <ul class="list-disc ml-6 text-sm">
                                ${data.breaches.map(b => `<li><b>${b.Name}</b> (${b.Domain}) on ${b.Date}<br>Data: ${b.DataClasses.join(', ')}</li>`).join('')}
                            </ul>
                        </div>
                        <section class="mt-6 mb-2">
                            <div class="max-w-xl mx-auto">
                                <div class="rounded-2xl border border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-6">
                                    <h5 class="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 text-lg flex items-center"><svg class='w-5 h-5 mr-2 text-yellow-500' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' d='M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z'/></svg>How to Recover from a Data Breach</h5>
                                    <ol class="list-decimal ml-6 text-base text-gray-800 dark:text-gray-100 space-y-1">
                                        <li><b>Change your password</b> for the affected service(s) immediately. Use a strong, unique password.</li>
                                        <li>If you reused this password elsewhere, <b>change it on all other sites</b> too.</li>
                                        <li><b>Enable Two-Factor Authentication (2FA)</b> on your accounts for extra security.</li>
                                        <li>Be alert for phishing emails or suspicious messages pretending to be from the breached service.</li>
                                        <li>Consider using a password manager to generate and store strong passwords.</li>
                                        <li>If sensitive info (like phone or address) was leaked, watch for identity theft or scams.</li>
                                    </ol>
                                </div>
                            </div>
                        </section>
                    `;
                } else {
                    resultBox.innerHTML = `
                        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-2">
                            <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">✅ No Breach Detected</h4>
                            <p>${data.message}</p>
                        </div>
                    `;
                }
            } else {
                resultBox.innerHTML = `<div class="text-red-600">${data.error || 'Error checking breach.'}</div>`;
            }
        } catch (err) {
            resultBox.innerHTML = `<div class="text-red-600">Network error. Please try again.</div>`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Check Now';
        }
    });
});
