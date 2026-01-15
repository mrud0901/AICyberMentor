document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const sendButton = document.getElementById('send-button');
    const token = localStorage.getItem('authToken');

    // Sidebar elements
    const sidebar = document.getElementById('history-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const newChatBtn = document.getElementById('new-chat-btn');

    // Sidebar toggle functionality
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768 && 
            !sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // New chat button
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }

    // Load chat history on page load
    loadChatHistory();
    loadHistorySidebar();

    chatForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const userMessage = userInput.value.trim();

        if (userMessage) {
            // Disable input while processing
            userInput.disabled = true;
            sendButton.disabled = true;

            // Display user's message
            appendMessage(userMessage, 'user');

            // Clear the input field
            userInput.value = '';

            // Show a typing indicator
            showTypingIndicator();

            try {
                const aiResponse = await getAIResponse(userMessage);
                // Remove typing indicator
                removeTypingIndicator();
                // Display AI response
                appendMessage(aiResponse, 'ai');
                
                // Update history sidebar if user is logged in
                if (token) {
                    loadHistorySidebar();
                }
            } catch (error) {
                console.error('Error getting AI response:', error);
                removeTypingIndicator();
                appendMessage('Sorry, something went wrong. Please try again later.', 'ai-error');
            } finally {
                // Re-enable input
                userInput.disabled = false;
                sendButton.disabled = false;
                userInput.focus();
            }
        }
    });

    function appendMessage(message, type, autoScroll = true, timestamp = null) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'mb-6';
        
        // Format timestamp
        const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        if (type === 'user') {
            messageWrapper.innerHTML = `
                <div class="flex items-start gap-3 justify-end">
                    <div class="flex flex-col items-end gap-1">
                        <div class="bg-indigo-600 dark:bg-purple-600 text-white p-4 rounded-2xl rounded-tr-none shadow max-w-2xl">
                            <p class="leading-relaxed">${escapeHtml(message)}</p>
                        </div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 px-2">${timeStr}</span>
                    </div>
                    <div class="w-10 h-10 bg-gray-300 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-user text-gray-600 dark:text-gray-300 text-sm"></i>
                    </div>
                </div>
            `;
        } else if (type === 'ai') {
            messageWrapper.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-indigo-600 dark:bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span class="text-xs font-bold text-white">AI</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 p-4 rounded-2xl rounded-tl-none shadow border border-gray-200 dark:border-slate-700 max-w-2xl">
                            <div class="leading-relaxed prose dark:prose-invert max-w-none">${formatMessage(message)}</div>
                        </div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 px-2">${timeStr}</span>
                    </div>
                </div>
            `;
        } else if (type === 'ai-error') {
            messageWrapper.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-exclamation-triangle text-white text-sm"></i>
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-2xl rounded-tl-none shadow border border-red-200 dark:border-red-700 max-w-2xl">
                            <p class="leading-relaxed">${escapeHtml(message)}</p>
                        </div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 px-2">${timeStr}</span>
                    </div>
                </div>
            `;
        }

        chatBox.appendChild(messageWrapper);
        if (autoScroll) {
            chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
        }
    }

    function showTypingIndicator() {
        const typingWrapper = document.createElement('div');
        typingWrapper.className = 'mb-6 typing-indicator';
        typingWrapper.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-indigo-600 dark:bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="text-xs font-bold text-white">AI</span>
                </div>
                <div class="bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 p-4 rounded-2xl rounded-tl-none shadow border border-gray-200 dark:border-slate-700">
                    <div class="flex gap-1">
                        <div class="w-2 h-2 bg-indigo-400 dark:bg-purple-400 rounded-full typing-dot"></div>
                        <div class="w-2 h-2 bg-indigo-400 dark:bg-purple-400 rounded-full typing-dot"></div>
                        <div class="w-2 h-2 bg-indigo-400 dark:bg-purple-400 rounded-full typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        chatBox.appendChild(typingWrapper);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatMessage(text) {
        // Escape HTML first
        let formatted = escapeHtml(text);
        
        // Convert **bold** to <strong>
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
        
        // Convert *italic* to <em>
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // Convert `code` to <code>
        formatted = formatted.replace(/`(.+?)`/g, '<code class="bg-slate-900 text-purple-300 px-1.5 py-0.5 rounded text-sm">$1</code>');
        
        // Convert line breaks to <br>
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Convert bullet points (- or •) to proper list items
        if (formatted.includes('• ') || formatted.match(/^- /m)) {
            const lines = formatted.split('<br>');
            let inList = false;
            formatted = lines.map(line => {
                if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
                    const content = line.trim().substring(2);
                    if (!inList) {
                        inList = true;
                        return '<ul class="list-disc list-inside space-y-1 mt-2"><li class="text-gray-300">' + content + '</li>';
                    }
                    return '<li class="text-gray-300">' + content + '</li>';
                } else {
                    if (inList && line.trim()) {
                        inList = false;
                        return '</ul>' + line;
                    } else if (inList && !line.trim()) {
                        inList = false;
                        return '</ul>';
                    }
                    return line;
                }
            }).join('<br>');
            if (inList) {
                formatted += '</ul>';
            }
        }
        
        return formatted;
    }

    async function getAIResponse(userMessage) {
        const headers = {
            'Content-Type': 'application/json',
        };

        // Add auth token if available
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://localhost:4000/api/chat', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ prompt: userMessage })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get response from server.');
        }

        const data = await response.json();
        return data.response;
    }

    async function loadChatHistory() {
        if (!token) return; // Don't load history if not logged in

        // Show loading indicator
        chatBox.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="text-center">
                    <div class="inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <i class="fas fa-spinner fa-spin text-indigo-600 dark:text-indigo-400"></i>
                        <span class="text-indigo-700 dark:text-indigo-300 font-medium">Loading your chat history...</span>
                    </div>
                </div>
            </div>
        `;

        try {
            const response = await fetch('http://localhost:4000/api/chat/history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Clear loading indicator
                chatBox.innerHTML = '';
                
                if (data.history.length === 0) {
                    // Show welcome message if no history
                    showWelcomeMessage();
                    updateHistoryBadge(0);
                } else {
                    // Show history restored notification
                    const historyCount = data.history.length;
                    const notificationHTML = `
                        <div class="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div class="flex items-center gap-3">
                                <i class="fas fa-check-circle text-green-600 dark:text-green-400 text-lg"></i>
                                <div class="text-sm text-green-800 dark:text-green-300">
                                    <strong>Welcome back!</strong> Restored ${historyCount} previous ${historyCount === 1 ? 'conversation' : 'conversations'}.
                                </div>
                            </div>
                        </div>
                    `;
                    chatBox.innerHTML = notificationHTML;
                    
                    // Display chat history
                    data.history.forEach(chat => {
                        appendMessage(chat.message, 'user', false, chat.created_at);
                        appendMessage(chat.response, 'ai', false, chat.created_at);
                    });
                    chatBox.scrollTop = chatBox.scrollHeight;
                    updateHistoryBadge(historyCount);
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            chatBox.innerHTML = '';
            showWelcomeMessage();
        }
    }

    function showWelcomeMessage() {
        const welcomeHTML = `
            <div class="flex items-start gap-3 mb-6">
                <div class="w-10 h-10 bg-indigo-600 dark:bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="text-xs font-bold text-white">AI</span>
                </div>
                <div class="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 p-4 rounded-2xl rounded-tl-none shadow border border-gray-200 dark:border-slate-700 max-w-2xl">
                    <p class="leading-relaxed">👋 Hello! I'm your AI Security Mentor. I'm here to help you understand cybersecurity and stay safe online.</p>
                    <p class="mt-3 leading-relaxed">You can ask me about:</p>
                    <ul class="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Two-factor authentication (2FA)</li>
                        <li>• Phishing attacks and how to spot them</li>
                        <li>• Password security best practices</li>
                        <li>• Malware and ransomware protection</li>
                        <li>• And much more!</li>
                    </ul>
                </div>
            </div>
        `;
        chatBox.innerHTML = welcomeHTML;
    }

    // Load and display history in sidebar
    async function loadHistorySidebar() {
        if (!token) {
            console.log('No token found, skipping sidebar load');
            return;
        }

        console.log('Loading history sidebar...');

        try {
            const response = await fetch('http://localhost:4000/api/chat/history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('History response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('History data received:', data);
                
                const historyList = document.getElementById('history-list');
                const countEl = document.getElementById('history-count');
                const clearAllBtn = document.getElementById('clear-all-btn');
                
                if (!historyList) {
                    console.error('history-list element not found!');
                    return;
                }
                if (!countEl) {
                    console.error('history-count element not found!');
                    return;
                }
                
                countEl.textContent = data.history.length;
                console.log('History count:', data.history.length);

                if (data.history.length === 0) {
                    console.log('No history found, showing empty state');
                    historyList.innerHTML = `
                        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                            <i class="fas fa-comments text-4xl mb-3 opacity-50"></i>
                            <p class="text-sm">No chat history yet</p>
                            <p class="text-xs mt-1">Start a conversation to see it here</p>
                        </div>
                    `;
                    if (clearAllBtn) clearAllBtn.disabled = true;
                } else {
                    console.log('Processing history items...');
                    // Group conversations by date
                    const groupedHistory = groupChatsByDate(data.history);
                    console.log('Grouped history:', groupedHistory);
                    historyList.innerHTML = '';
                    
                    let itemCount = 0;
                    for (const [date, chats] of Object.entries(groupedHistory)) {
                        console.log(`Adding date header: ${date} with ${chats.length} chats`);
                        // Add date header
                        const dateHeader = document.createElement('div');
                        dateHeader.className = 'text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 sticky top-0 bg-white dark:bg-slate-800 z-10';
                        dateHeader.textContent = date;
                        historyList.appendChild(dateHeader);

                        // Add chat items
                        chats.forEach((chat, index) => {
                            console.log(`Creating chat item ${index + 1}:`, chat);
                            const chatItem = createChatHistoryItem(chat);
                            historyList.appendChild(chatItem);
                            itemCount++;
                        });
                    }
                    console.log(`Total items added to sidebar: ${itemCount}`);
                    
                    if (clearAllBtn) clearAllBtn.disabled = false;
                }
            } else {
                console.error('Response not OK:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error loading history sidebar:', error);
        }
    }

    // Group chats by date
    function groupChatsByDate(history) {
        const grouped = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        history.forEach(chat => {
            const chatDate = new Date(chat.created_at);
            let dateLabel;
            
            if (chatDate.toDateString() === today.toDateString()) {
                dateLabel = 'Today';
            } else if (chatDate.toDateString() === yesterday.toDateString()) {
                dateLabel = 'Yesterday';
            } else if (chatDate.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
                dateLabel = chatDate.toLocaleDateString('en-US', { weekday: 'long' });
            } else {
                dateLabel = chatDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
            
            if (!grouped[dateLabel]) {
                grouped[dateLabel] = [];
            }
            grouped[dateLabel].push(chat);
        });
        
        return grouped;
    }

    // Create chat history item element
    function createChatHistoryItem(chat) {
        const div = document.createElement('div');
        div.className = 'chat-history-item p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-purple-600 group';
        
        // Truncate message to first 50 characters
        const truncatedMessage = chat.message.length > 50 
            ? chat.message.substring(0, 50) + '...' 
            : chat.message;
        
        const time = new Date(chat.created_at).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        div.innerHTML = `
            <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="fas fa-message text-indigo-600 dark:text-purple-400 text-xs"></i>
                        <span class="text-xs text-gray-500 dark:text-gray-400">${time}</span>
                    </div>
                    <p class="text-sm text-gray-800 dark:text-gray-200 truncate font-medium">${escapeHtml(truncatedMessage)}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">${escapeHtml(chat.response.substring(0, 60))}...</p>
                </div>
                <button onclick="deleteChat(event, ${chat.id})" class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 transition-opacity">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
        `;
        
        // Load this chat when clicked
        div.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                loadSpecificChat(chat);
            }
        });
        
        return div;
    }

    // Load a specific chat conversation
    function loadSpecificChat(chat) {
        chatBox.innerHTML = '';
        appendMessage(chat.message, 'user', false, chat.created_at);
        appendMessage(chat.response, 'ai', false, chat.created_at);
        
        // Show active badge
        const activeBadge = document.getElementById('current-chat-badge');
        if (activeBadge) {
            activeBadge.classList.remove('hidden');
        }
        
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
            sidebar.classList.remove('open');
        }
    }

    // Start a new chat
    function startNewChat() {
        chatBox.innerHTML = '';
        showWelcomeMessage();
        userInput.value = '';
        userInput.focus();
        
        // Hide active badge
        const activeBadge = document.getElementById('current-chat-badge');
        if (activeBadge) {
            activeBadge.classList.add('hidden');
        }
        
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
            sidebar.classList.remove('open');
        }
    }

    // Clear current chat (without deleting from history)
    window.clearCurrentChat = function() {
        if (confirm('Clear the current chat? (This will not delete it from history)')) {
            startNewChat();
        }
    };

    // Delete a specific chat
    window.deleteChat = async function(event, chatId) {
        event.stopPropagation();
        
        if (!confirm('Delete this conversation?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/api/chat/history/${chatId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                loadHistorySidebar();
                // If this was the current chat, clear it
                const messagesCount = chatBox.querySelectorAll('.mb-6').length;
                if (messagesCount === 2) { // Only one user message and one AI response
                    startNewChat();
                }
            } else {
                alert('Failed to delete conversation.');
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            alert('Failed to delete conversation.');
        }
    };

    // Clear all history
    window.clearAllHistory = async function() {
        if (!token) return;

        if (!confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/api/chat/history', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                startNewChat();
                loadHistorySidebar();
                
                // Show success notification
                const successNotification = document.createElement('div');
                successNotification.className = 'mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4';
                successNotification.innerHTML = `
                    <div class="flex items-center gap-3">
                        <i class="fas fa-check-circle text-green-600 dark:text-green-400 text-lg"></i>
                        <div class="text-sm text-green-800 dark:text-green-300">
                            <strong>Success!</strong> All chat history has been cleared.
                        </div>
                    </div>
                `;
                chatBox.insertBefore(successNotification, chatBox.firstChild);
                
                // Remove notification after 3 seconds
                setTimeout(() => {
                    successNotification.remove();
                }, 3000);
            } else {
                alert('Failed to clear chat history.');
            }
        } catch (error) {
            console.error('Error clearing chat history:', error);
            alert('Failed to clear chat history.');
        }
    };
});

