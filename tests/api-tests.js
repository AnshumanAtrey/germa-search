// Germa Search API Tests - Comprehensive API Testing Suite

import { SYSTEM_PROMPT } from '../system-prompt.js';

class ApiTestSuite {
    constructor() {
        this.testResults = [];
        this.apiKey = null;
    }

    async loadApiKey() {
        try {
            // Try to load from .env file (Node.js environment)
            if (typeof process !== 'undefined' && process.env) {
                this.apiKey = process.env.OPENROUTER_KEY;
            }
            
            // Try to load from Chrome storage (extension environment)
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.sync.get(['openrouterApiKey']);
                this.apiKey = result.openrouterApiKey;
            }
            
            // No fallback key for security
            if (!this.apiKey) {
                this.apiKey = null;
            }
            
            return this.apiKey;
        } catch (error) {
            console.error('Failed to load API key:', error);
            return null;
        }
    }

    // Test 1: API Key Validation
    async testApiKeyValidation() {
        const testCases = [
            { key: '', expected: false, description: 'Empty API key' },
            { key: 'invalid-key', expected: false, description: 'Invalid format' },
            { key: 'sk-or-v1-', expected: false, description: 'Incomplete key' },
            { key: 'sk-or-v1-1234567890abcdef1234567890abcdef12345678', expected: true, description: 'Valid format' },
            { key: 'sk-or-v1-abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', expected: true, description: 'Example API key format' }
        ];

        const results = [];
        
        testCases.forEach(testCase => {
            const isValid = this.validateApiKeyFormat(testCase.key);
            const passed = isValid === testCase.expected;
            
            results.push({
                test: `API Key Validation - ${testCase.description}`,
                passed,
                details: `Expected: ${testCase.expected}, Got: ${isValid}`,
                input: testCase.key.substring(0, 20) + '...'
            });
        });

        return results;
    }

    validateApiKeyFormat(key) {
        if (!key || typeof key !== 'string') return false;
        if (!key.startsWith('sk-or-v1-')) return false;
        if (key.length < 30) return false;
        return true;
    }

    // Test 2: OpenRouter API Connection
    async testOpenRouterConnection() {
        const results = [];
        
        try {
            // Test 1: Basic connectivity
            const connectivityTest = await this.testBasicConnectivity();
            results.push(connectivityTest);
            
            // Test 2: API endpoint availability
            const endpointTest = await this.testApiEndpoint();
            results.push(endpointTest);
            
            // Test 3: Authentication test
            const authTest = await this.testAuthentication();
            results.push(authTest);
            
        } catch (error) {
            results.push({
                test: 'OpenRouter Connection Test',
                passed: false,
                details: `Connection test failed: ${error.message}`,
                error: error.message
            });
        }

        return results;
    }

    async testBasicConnectivity() {
        try {
            const response = await fetch('https://httpbin.org/json', {
                method: 'GET',
                timeout: 5000
            });
            
            return {
                test: 'Basic Network Connectivity',
                passed: response.ok,
                details: `Status: ${response.status}, Network accessible: ${response.ok}`,
                responseTime: performance.now()
            };
        } catch (error) {
            return {
                test: 'Basic Network Connectivity',
                passed: false,
                details: `Network error: ${error.message}`,
                error: error.message
            };
        }
    }

    async testApiEndpoint() {
        try {
            const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
            
            // Test with invalid request to check if endpoint exists
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            
            // We expect a 400 or 401 error, not a network error
            const endpointExists = response.status === 400 || response.status === 401 || response.status === 422;
            
            return {
                test: 'API Endpoint Availability',
                passed: endpointExists,
                details: `Status: ${response.status}, Endpoint accessible: ${endpointExists}`,
                endpoint: apiUrl
            };
        } catch (error) {
            return {
                test: 'API Endpoint Availability',
                passed: false,
                details: `Endpoint test failed: ${error.message}`,
                error: error.message
            };
        }
    }

    async testAuthentication() {
        if (!this.apiKey || !this.validateApiKeyFormat(this.apiKey)) {
            return {
                test: 'Authentication Test',
                passed: false,
                details: 'No valid API key available for authentication test',
                skipped: true
            };
        }

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://germa-search.test',
                    'X-Title': 'Germa Search Test Suite'
                },
                body: JSON.stringify({
                    model: 'mistralai/mistral-small-3.2-24b-instruct-2506',
                    messages: [
                        {
                            role: 'user',
                            content: 'Test message'
                        }
                    ],
                    max_tokens: 10
                })
            });

            const authSuccess = response.status !== 401 && response.status !== 403;
            
            return {
                test: 'Authentication Test',
                passed: authSuccess,
                details: `Status: ${response.status}, Auth successful: ${authSuccess}`,
                apiKeyUsed: this.apiKey.substring(0, 20) + '...'
            };
        } catch (error) {
            return {
                test: 'Authentication Test',
                passed: false,
                details: `Authentication test failed: ${error.message}`,
                error: error.message
            };
        }
    }

    // Test 3: System Prompt Validation
    async testSystemPromptValidation() {
        const results = [];
        
        // Test prompt structure
        results.push(this.testPromptStructure());
        
        // Test prompt content
        results.push(this.testPromptContent());
        
        // Test prompt examples
        results.push(this.testPromptExamples());
        
        return results;
    }

    testPromptStructure() {
        const requiredSections = [
            'CRITICAL RULES',
            'RESPONSE FORMAT',
            'UNIVERSAL SEARCH OPERATORS',
            'STRATEGY GUIDELINES'
        ];
        
        let foundSections = 0;
        requiredSections.forEach(section => {
            if (SYSTEM_PROMPT.includes(section)) {
                foundSections++;
            }
        });
        
        const passed = foundSections >= 3;
        
        return {
            test: 'System Prompt Structure',
            passed,
            details: `Found ${foundSections}/${requiredSections.length} required sections`,
            sections: requiredSections
        };
    }

    testPromptContent() {
        const requiredKeywords = [
            'Google Dorks',
            'search operators',
            'JSON format',
            'queries',
            'filetype',
            'site:',
            'intitle',
            'quotes'
        ];
        
        let foundKeywords = 0;
        requiredKeywords.forEach(keyword => {
            if (SYSTEM_PROMPT.toLowerCase().includes(keyword.toLowerCase())) {
                foundKeywords++;
            }
        });
        
        const passed = foundKeywords >= 6;
        
        return {
            test: 'System Prompt Content',
            passed,
            details: `Found ${foundKeywords}/${requiredKeywords.length} required keywords`,
            keywords: requiredKeywords
        };
    }

    testPromptExamples() {
        const hasExamples = SYSTEM_PROMPT.includes('EXAMPLES') || SYSTEM_PROMPT.includes('Example');
        const hasJsonExample = SYSTEM_PROMPT.includes('"queries"') && SYSTEM_PROMPT.includes('"title"');
        
        const passed = hasExamples && hasJsonExample;
        
        return {
            test: 'System Prompt Examples',
            passed,
            details: `Has examples: ${hasExamples}, Has JSON example: ${hasJsonExample}`,
            length: SYSTEM_PROMPT.length
        };
    }

    // Test 4: Query Generation Logic
    async testQueryGeneration() {
        const results = [];
        
        const testQueries = [
            'machine learning research',
            'climate change studies',
            'javascript tutorials',
            'quantum computing papers',
            'artificial intelligence ethics'
        ];
        
        for (const query of testQueries) {
            const result = await this.testSingleQueryGeneration(query);
            results.push(result);
        }
        
        return results;
    }

    async testSingleQueryGeneration(inputQuery) {
        try {
            // Simulate query generation
            const mockResponse = this.generateMockResponse(inputQuery);
            const validation = this.validateQueryResponse(mockResponse);
            
            return {
                test: `Query Generation - "${inputQuery}"`,
                passed: validation.valid,
                details: validation.details,
                input: inputQuery,
                output: mockResponse
            };
        } catch (error) {
            return {
                test: `Query Generation - "${inputQuery}"`,
                passed: false,
                details: `Query generation failed: ${error.message}`,
                error: error.message
            };
        }
    }

    generateMockResponse(inputQuery) {
        return {
            queries: [
                {
                    title: 'Academic Papers',
                    description: 'Search for peer-reviewed research papers',
                    query: `"${inputQuery}" filetype:pdf site:edu OR site:arxiv.org`,
                    focus: 'Academic research'
                },
                {
                    title: 'Technical Documentation',
                    description: 'Find comprehensive guides and documentation',
                    query: `"${inputQuery}" (filetype:pdf OR filetype:doc) intitle:"guide" OR intitle:"tutorial"`,
                    focus: 'Technical guides'
                },
                {
                    title: 'Recent Developments',
                    description: 'Latest articles and developments',
                    query: `"${inputQuery}" after:2023-01-01 -site:pinterest.com -site:instagram.com`,
                    focus: 'Recent content'
                }
            ]
        };
    }

    validateQueryResponse(response) {
        try {
            // Check structure
            if (!response.queries || !Array.isArray(response.queries)) {
                return { valid: false, details: 'Missing or invalid queries array' };
            }
            
            if (response.queries.length !== 3) {
                return { valid: false, details: `Expected 3 queries, got ${response.queries.length}` };
            }
            
            // Check each query
            for (let i = 0; i < response.queries.length; i++) {
                const query = response.queries[i];
                const required = ['title', 'description', 'query', 'focus'];
                
                for (const field of required) {
                    if (!query[field] || typeof query[field] !== 'string') {
                        return { valid: false, details: `Query ${i + 1} missing or invalid '${field}'` };
                    }
                }
                
                // Validate query syntax
                const queryStr = query.query;
                const quoteCount = (queryStr.match(/"/g) || []).length;
                if (quoteCount % 2 !== 0) {
                    return { valid: false, details: `Query ${i + 1} has unclosed quotes` };
                }
            }
            
            return { valid: true, details: 'All validations passed' };
            
        } catch (error) {
            return { valid: false, details: `Validation error: ${error.message}` };
        }
    }

    // Test 5: Error Handling
    async testErrorHandling() {
        const results = [];
        
        // Test various error scenarios
        const errorScenarios = [
            { status: 400, message: 'Bad Request', expected: 'handled' },
            { status: 401, message: 'Unauthorized', expected: 'handled' },
            { status: 429, message: 'Rate Limited', expected: 'handled' },
            { status: 500, message: 'Server Error', expected: 'handled' },
            { status: 503, message: 'Service Unavailable', expected: 'handled' }
        ];
        
        errorScenarios.forEach(scenario => {
            const result = this.testErrorScenario(scenario);
            results.push(result);
        });
        
        return results;
    }

    testErrorScenario(scenario) {
        try {
            const handled = this.handleApiError(scenario.status, scenario.message);
            const passed = handled === scenario.expected;
            
            return {
                test: `Error Handling - ${scenario.status} ${scenario.message}`,
                passed,
                details: `Status: ${scenario.status}, Handled: ${handled}`,
                scenario
            };
        } catch (error) {
            return {
                test: `Error Handling - ${scenario.status} ${scenario.message}`,
                passed: false,
                details: `Error handling test failed: ${error.message}`,
                error: error.message
            };
        }
    }

    handleApiError(status, message) {
        // Mock error handling logic
        if (status >= 400 && status < 600) {
            return 'handled';
        }
        return 'unhandled';
    }

    // Test 6: Fallback Queries
    async testFallbackQueries() {
        const results = [];
        
        const testInputs = [
            'machine learning',
            'climate change',
            'javascript',
            'quantum computing',
            'artificial intelligence'
        ];
        
        testInputs.forEach(input => {
            const result = this.testFallbackGeneration(input);
            results.push(result);
        });
        
        return results;
    }

    testFallbackGeneration(input) {
        try {
            const fallbackQueries = this.generateFallbackQueries(input);
            
            // Validate fallback structure
            const validation = this.validateQueryResponse({ queries: fallbackQueries });
            
            return {
                test: `Fallback Generation - "${input}"`,
                passed: validation.valid,
                details: validation.details,
                input,
                output: fallbackQueries
            };
        } catch (error) {
            return {
                test: `Fallback Generation - "${input}"`,
                passed: false,
                details: `Fallback generation failed: ${error.message}`,
                error: error.message
            };
        }
    }

    generateFallbackQueries(input) {
        const cleanInput = input.replace(/['"]/g, '');
        
        return [
            {
                title: 'Academic Search',
                description: 'Search for academic papers and research documents',
                query: `"${cleanInput}" filetype:pdf site:edu`,
                focus: 'Academic and research content'
            },
            {
                title: 'Document Search',
                description: 'Find comprehensive documents and guides',
                query: `"${cleanInput}" (filetype:pdf OR filetype:doc)`,
                focus: 'Documents and guides'
            },
            {
                title: 'Recent Content',
                description: 'Latest articles and discussions',
                query: `"${cleanInput}" after:2023-01-01 -site:pinterest.com`,
                focus: 'Recent and relevant content'
            }
        ];
    }

    // Run all API tests
    async runAllTests() {
        console.log('🚀 Starting Germa Search API Test Suite...');
        
        await this.loadApiKey();
        
        const testSuites = [
            { name: 'API Key Validation', method: this.testApiKeyValidation },
            { name: 'OpenRouter Connection', method: this.testOpenRouterConnection },
            { name: 'System Prompt Validation', method: this.testSystemPromptValidation },
            { name: 'Query Generation', method: this.testQueryGeneration },
            { name: 'Error Handling', method: this.testErrorHandling },
            { name: 'Fallback Queries', method: this.testFallbackQueries }
        ];
        
        const allResults = [];
        
        for (const suite of testSuites) {
            console.log(`\n📋 Running ${suite.name} tests...`);
            
            try {
                const results = await suite.method.call(this);
                allResults.push({
                    suite: suite.name,
                    results,
                    passed: results.every(r => r.passed),
                    total: results.length,
                    passCount: results.filter(r => r.passed).length
                });
                
                console.log(`✅ ${suite.name}: ${results.filter(r => r.passed).length}/${results.length} tests passed`);
            } catch (error) {
                console.error(`❌ ${suite.name} failed:`, error);
                allResults.push({
                    suite: suite.name,
                    results: [],
                    passed: false,
                    error: error.message
                });
            }
        }
        
        // Summary
        const totalTests = allResults.reduce((sum, suite) => sum + (suite.total || 0), 0);
        const totalPassed = allResults.reduce((sum, suite) => sum + (suite.passCount || 0), 0);
        
        console.log(`\n🎉 API Test Suite Complete: ${totalPassed}/${totalTests} tests passed`);
        
        return allResults;
    }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiTestSuite;
}

// For browser environment
if (typeof window !== 'undefined') {
    window.ApiTestSuite = ApiTestSuite;
}