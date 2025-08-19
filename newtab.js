// OpenRouterAPI is loaded from api.js

class GermaSearch {
    constructor() {
        this.api = new OpenRouterAPI();
        this.currentApiKey = null;
        this.keyVisible = false;
        this.initializeEventListeners();
        this.checkApiKey();
    }

    initializeEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const saveApiKeyBtn = document.getElementById('saveApiKey');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const settingsBtn = document.getElementById('settingsBtn');
        const closeSettingsBtn = document.getElementById('closeSettings');
        const cancelSettingsBtn = document.getElementById('cancelSettings');
        const toggleKeyBtn = document.getElementById('toggleKeyVisibility');

        // Search on button click
        searchBtn.addEventListener('click', () => this.handleSearch());

        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Save API key
        saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());

        // Save API key on Enter in input field
        apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });

        // Settings button (toggle)
        settingsBtn.addEventListener('click', () => this.toggleSettings());

        // Close settings
        closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        cancelSettingsBtn.addEventListener('click', () => this.hideSettings());

        // Toggle key visibility
        toggleKeyBtn.addEventListener('click', () => this.toggleKeyVisibility());

        // Focus management
        setTimeout(() => {
            if (!document.getElementById('settingsPanel').classList.contains('hidden')) {
                apiKeyInput.focus();
            } else {
                searchInput.focus();
            }
        }, 100);
    }

    async checkApiKey() {
        try {
            const result = await chrome.storage.sync.get(['openrouterApiKey']);
            if (!result.openrouterApiKey) {
                this.showInitialSetup();
            } else {
                this.hideSettings();
                this.currentApiKey = result.openrouterApiKey;
            }
        } catch (error) {
            console.error('Error checking API key:', error);
            this.showInitialSetup();
        }
    }

    showInitialSetup() {
        // Show settings panel for first-time setup
        document.getElementById('settingsPanel').classList.remove('hidden');
        document.getElementById('searchResults').classList.add('hidden');
        
        // Update UI for initial setup
        document.getElementById('settingsTitle').textContent = '🔑 API KEY REQUIRED';
        document.getElementById('settingsDescription').textContent = 'Get your free OpenRouter API key to start searching';
        document.getElementById('currentKeySection').style.display = 'none';
        document.getElementById('optionalText').style.display = 'none';
        document.getElementById('keyInputLabel').textContent = 'OpenRouter API Key:';
        document.getElementById('saveBtnText').textContent = 'SAVE & START SEARCHING';
        
        // Focus on API key input
        setTimeout(() => {
            document.getElementById('apiKeyInput').focus();
        }, 100);
    }

    toggleSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        
        if (settingsPanel.classList.contains('hidden')) {
            this.showSettings();
        } else {
            this.hideSettings();
        }
    }

    showSettings() {
        // Show settings panel for existing users
        document.getElementById('settingsPanel').classList.remove('hidden');
        
        // Update UI for settings mode
        document.getElementById('settingsTitle').textContent = '⚙️ SETTINGS';
        document.getElementById('settingsDescription').textContent = 'Manage your API key and preferences';
        document.getElementById('currentKeySection').style.display = 'block';
        document.getElementById('optionalText').style.display = 'inline';
        document.getElementById('keyInputLabel').textContent = 'New API Key:';
        document.getElementById('saveBtnText').textContent = 'UPDATE SETTINGS';
        
        // Load and display current API key (masked)
        this.loadCurrentApiKey();
        
        // Clear input field
        document.getElementById('apiKeyInput').value = '';
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('apiKeyInput').focus();
        }, 100);
    }

    hideSettings() {
        document.getElementById('settingsPanel').classList.add('hidden');
        
        // Focus on search input
        setTimeout(() => {
            document.getElementById('searchInput').focus();
        }, 100);
    }

    async loadCurrentApiKey() {
        try {
            const result = await chrome.storage.sync.get(['openrouterApiKey']);
            if (result.openrouterApiKey) {
                this.currentApiKey = result.openrouterApiKey;
                this.updateMaskedKey();
            }
        } catch (error) {
            console.error('Error loading API key:', error);
        }
    }

    updateMaskedKey() {
        if (this.currentApiKey) {
            const maskedKey = '••••••••••••••••••••••••••••••••••••••••' + this.currentApiKey.slice(-8);
            document.getElementById('maskedKey').textContent = maskedKey;
        }
    }

    toggleKeyVisibility() {
        const maskedKeyElement = document.getElementById('maskedKey');
        const toggleBtn = document.getElementById('toggleKeyVisibility');
        
        if (this.keyVisible) {
            // Hide key
            this.updateMaskedKey();
            this.keyVisible = false;
            toggleBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            `;
        } else {
            // Show key
            maskedKeyElement.textContent = this.currentApiKey || 'No key set';
            this.keyVisible = true;
            toggleBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            `;
        }
    }

    async saveApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const newApiKey = apiKeyInput.value.trim();

        // If no new key provided and we have a current key, just close settings
        if (!newApiKey && this.currentApiKey) {
            this.hideSettings();
            return;
        }

        // If no key provided and no current key, show error
        if (!newApiKey) {
            this.showNotification('Please enter your API key', 'error');
            return;
        }

        // Validate API key format
        if (!newApiKey.startsWith('sk-or-v1-')) {
            this.showNotification('Invalid API key format. Should start with "sk-or-v1-"', 'error');
            return;
        }

        try {
            await chrome.storage.sync.set({ openrouterApiKey: newApiKey });
            this.currentApiKey = newApiKey;
            
            if (this.currentApiKey) {
                this.showNotification('API key updated successfully!', 'success');
            } else {
                this.showNotification('API key saved successfully!', 'success');
            }
            
            this.hideSettings();
            
            // Clear the input for security
            apiKeyInput.value = '';
            
        } catch (error) {
            console.error('Error saving API key:', error);
            this.showNotification('Error saving API key. Please try again.', 'error');
        }
    }



    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            border-radius: 2px;
            font-family: inherit;
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            z-index: 1000;
            transition: all 0.3s ease;
            ${type === 'success' ? 'background: var(--success-green); color: var(--dark-bg);' : ''}
            ${type === 'error' ? 'background: var(--warning-red); color: var(--text-primary);' : ''}
            ${type === 'info' ? 'background: var(--primary-yellow); color: var(--dark-bg);' : ''}
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    async handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();

        if (!query) {
            searchInput.focus();
            return;
        }

        this.showLoading(true);
        this.hideResults();

        try {
            const queries = await this.api.generateSearchQueries(query);
            this.displayResults(queries);
        } catch (error) {
            console.error('Search error:', error);
            
            // Show fallback queries on error
            const fallbackQueries = this.api.generateFallbackQueries(query);
            this.displayResults(fallbackQueries, true);
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (show) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }

    hideResults() {
        const searchResults = document.getElementById('searchResults');
        searchResults.classList.add('hidden');
    }

    displayResults(queries, isFallback = false) {
        const searchResults = document.getElementById('searchResults');
        const queryCards = document.getElementById('queryCards');

        // Clear previous results
        queryCards.innerHTML = '';

        // Add fallback notice if needed
        if (isFallback) {
            const notice = document.createElement('div');
            notice.style.cssText = 'background: var(--warning-red); border: 1px solid #ff6666; padding: 1rem; border-radius: 2px; margin-bottom: 1rem; color: var(--text-primary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;';
            notice.innerHTML = '⚠ FALLBACK MODE - API ERROR DETECTED';
            queryCards.appendChild(notice);
        }

        // Create query cards
        queries.forEach((queryData, index) => {
            const card = this.createQueryCard(queryData, index + 1);
            queryCards.appendChild(card);
        });

        searchResults.classList.remove('hidden');
    }

    createQueryCard(queryData, index) {
        const card = document.createElement('div');
        card.className = 'query-card';
        
        card.innerHTML = `
            <h4>${String(index).padStart(2, '0')} // ${queryData.title}</h4>
            <p>${queryData.description}</p>
            <div class="query-text">${this.escapeHtml(queryData.query)}</div>
            <div style="margin-top: 0.75rem; font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
                TARGET: ${queryData.focus}
            </div>
        `;

        // Add click handler to open search in new tab
        card.addEventListener('click', () => {
            this.openSearch(queryData.query);
        });

        return card;
    }

    openSearch(query) {
        // Encode the query for URL
        const encodedQuery = encodeURIComponent(query);
        
        // Try Google first, fallback to other engines
        const searchEngines = [
            `https://www.google.com/search?q=${encodedQuery}`,
            `https://www.bing.com/search?q=${encodedQuery}`,
            `https://duckduckgo.com/?q=${encodedQuery}`
        ];

        // Open in new tab
        chrome.tabs.create({ url: searchEngines[0] });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GermaSearch();
});