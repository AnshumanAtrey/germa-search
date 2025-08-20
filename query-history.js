
 

class QueryHistory {
    constructor() {
        this.storageKey = 'germa_query_history';
        this.maxHistoryItems = 50; 
    }

   
    async saveQuery(query, strategies, timestamp = Date.now()) {
        try {
            const history = await this.getHistory();
            
           
            const existingIndex = history.findIndex(item => 
                item.query.toLowerCase().trim() === query.toLowerCase().trim()
            );
            
            if (existingIndex !== -1) {
                // Update existing query with new timestamp and strategies
                history[existingIndex].timestamp = timestamp;
                history[existingIndex].strategies = strategies;
                history[existingIndex].useCount = (history[existingIndex].useCount || 1) + 1;
                
                // Move to front of array
                const updatedItem = history.splice(existingIndex, 1)[0];
                history.unshift(updatedItem);
            } else {
                // Add new query
                const queryItem = {
                    id: this.generateId(),
                    query: query.trim(),
                    strategies,
                    timestamp,
                    useCount: 1
                };
                
                history.unshift(queryItem); // Add to beginning
                
                // Limit history size
                if (history.length > this.maxHistoryItems) {
                    history.splice(this.maxHistoryItems);
                }
            }
            
            await chrome.storage.local.set({ [this.storageKey]: history });
            return true;
        } catch (error) {
            console.error('Error saving query to history:', error);
            return false;
        }
    }

  
    async getHistory() {
        try {
            const result = await chrome.storage.local.get([this.storageKey]);
            return result[this.storageKey] || [];
        } catch (error) {
            console.error('Error getting query history:', error);
            return [];
        }
    }

    
    async getRecentSearches() {
        const history = await this.getHistory();
        return history.slice(0, 10);
    }

   
    async searchHistory(searchTerm) {
        const history = await this.getHistory();
        const term = searchTerm.toLowerCase().trim();
        
        return history.filter(item => 
            item.query.toLowerCase().includes(term)
        );
    }

    
    async deleteQuery(queryId) {
        try {
            const history = await this.getHistory();
            const filteredHistory = history.filter(item => item.id !== queryId);
            await chrome.storage.local.set({ [this.storageKey]: filteredHistory });
            return true;
        } catch (error) {
            console.error('Error deleting query from history:', error);
            return false;
        }
    }

    
    async clearHistory() {
        try {
            await chrome.storage.local.remove([this.storageKey]);
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }

  
    async incrementUseCount(queryId) {
        try {
            const history = await this.getHistory();
            const index = history.findIndex(item => item.id === queryId);
            
            if (index !== -1) {
                history[index].useCount = (history[index].useCount || 1) + 1;
                history[index].timestamp = Date.now(); // Update last used time
                await chrome.storage.local.set({ [this.storageKey]: history });
            }
        } catch (error) {
            console.error('Error incrementing use count:', error);
        }
    }

    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        
        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    
    async getStats() {
        const history = await this.getHistory();
        
        return {
            totalQueries: history.length,
            totalSearches: history.reduce((sum, item) => sum + (item.useCount || 1), 0),
            oldestQuery: history.length > 0 ? history[history.length - 1].timestamp : null,
            newestQuery: history.length > 0 ? history[0].timestamp : null
        };
    }
}

// Make it globally available
window.QueryHistory = QueryHistory;
