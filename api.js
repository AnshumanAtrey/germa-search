// SYSTEM_PROMPT is loaded from system-prompt.js

class OpenRouterAPI {
    constructor() {
        this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
        this.model = 'mistralai/mistral-small-3.2-24b-instruct-2506';
        this.apiKey = null;
        
        // Development API key removed for security
    }

    async initialize() {
        // Check for development API key first
        if (this.developmentApiKey) {
            this.apiKey = this.developmentApiKey;
            console.log('🔧 Using development API key');
            return;
        }
        
        // Get API key from storage
        const result = await chrome.storage.sync.get(['openrouterApiKey', 'selectedModel']);
        this.apiKey = result.openrouterApiKey;
        
        // Update model if user selected a different one
        if (result.selectedModel) {
            this.model = result.selectedModel;
        }
        
        if (!this.apiKey) {
            throw new Error('OpenRouter API key not found. Please set it in extension options.');
        }
    }

    async generateSearchQueries(userQuery) {
        if (!this.apiKey) {
            await this.initialize();
        }

        const payload = {
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                {
                    role: 'user', 
                    content: `Generate 3 optimized search queries for: "${userQuery}"`
                }
            ],
            temperature: 0.3,
            max_tokens: 1500,
            top_p: 0.9
        };

        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://germa-search.extension',
                    'X-Title': 'Germa Search Extension'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            
            if (!content) {
                throw new Error('No response content received from API');
            }

            // Parse JSON response - handle markdown code blocks and quote issues
            try {
                let jsonContent = content.trim();
                
                // Remove markdown code blocks if present
                if (jsonContent.startsWith('```json')) {
                    jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonContent.startsWith('```')) {
                    jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }
                
                // Clean up any extra whitespace
                jsonContent = jsonContent.trim();
                
                // Fix common JSON issues with nested quotes in search queries
                // Replace double quotes inside query strings with escaped quotes
                jsonContent = jsonContent.replace(/"query":\s*"([^"]*)"([^"]*)"([^"]*)"/g, (match, before, middle, after) => {
                    // If we find nested quotes, escape them
                    const fixedQuery = `${before}\\"${middle}\\"${after}`;
                    return `"query": "${fixedQuery}"`;
                });
                
                console.log('🔍 Cleaned JSON content:', jsonContent);
                
                const parsed = JSON.parse(jsonContent);
                
                // Validate response structure
                if (!parsed.queries || !Array.isArray(parsed.queries)) {
                    throw new Error('Invalid response format: missing queries array');
                }
                
                if (parsed.queries.length !== 3) {
                    console.warn(`Expected 3 queries, got ${parsed.queries.length}. Using available queries.`);
                }

                // Validate each query object
                for (let i = 0; i < parsed.queries.length; i++) {
                    const query = parsed.queries[i];
                    if (!query.title || !query.description || !query.query || !query.focus) {
                        throw new Error(`Incomplete query object at index ${i}: missing required fields`);
                    }
                }

                console.log('✅ Successfully parsed', parsed.queries.length, 'queries');
                return parsed.queries;
                
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Raw content:', content);
                console.error('Attempting advanced fallback...');
                
                // Advanced fallback: try to fix the JSON manually
                try {
                    let fixedContent = content.trim();
                    
                    // Remove markdown blocks
                    fixedContent = fixedContent.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
                    
                    // More aggressive quote fixing - replace all instances of "" with \"
                    fixedContent = fixedContent.replace(/"query":\s*"([^"]*""[^"]*)"([^"]*)/g, (match, p1, p2) => {
                        const fixedQuery = p1.replace(/""/g, '\\"') + p2;
                        return `"query": "${fixedQuery}"`;
                    });
                    
                    // Try to fix any remaining quote issues
                    fixedContent = fixedContent.replace(/""([^"]*)""/g, '\\"$1\\"');
                    
                    console.log('🔧 Attempting fixed JSON:', fixedContent);
                    
                    const parsed = JSON.parse(fixedContent);
                    
                    if (parsed.queries && Array.isArray(parsed.queries)) {
                        console.log('✅ Advanced fallback successful');
                        return parsed.queries;
                    }
                } catch (advancedError) {
                    console.error('Advanced fallback also failed:', advancedError);
                }
                
                // Last resort: try regex extraction with quote fixing
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        let extractedJson = jsonMatch[0];
                        
                        // Fix quotes in the extracted JSON
                        extractedJson = extractedJson.replace(/""([^"]*)""/g, '\\"$1\\"');
                        
                        console.log('🔧 Final attempt with regex:', extractedJson);
                        const parsed = JSON.parse(extractedJson);
                        
                        if (parsed.queries && Array.isArray(parsed.queries)) {
                            console.log('✅ Final regex extraction successful');
                            return parsed.queries;
                        }
                    }
                } catch (finalError) {
                    console.error('Final extraction failed:', finalError);
                }
                
                throw new Error('Failed to parse AI response as JSON');
            }

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Fallback queries in case API fails
    generateFallbackQueries(userQuery) {
        const cleanQuery = userQuery.replace(/['"]/g, '');
        
        return [
            {
                title: 'Academic Search',
                description: 'Search for academic papers and research documents',
                query: `"${cleanQuery}" filetype:pdf site:edu`,
                focus: 'Academic and research content'
            },
            {
                title: 'Document Search', 
                description: 'Find comprehensive documents and guides',
                query: `"${cleanQuery}" (filetype:pdf OR filetype:doc)`,
                focus: 'Documents and guides'
            },
            {
                title: 'Recent Content',
                description: 'Latest articles and discussions',
                query: `"${cleanQuery}" after:2023-01-01 -site:pinterest.com`,
                focus: 'Recent and relevant content'
            }
        ];
    }
}

// OpenRouterAPI is available globally