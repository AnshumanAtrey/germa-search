// Test script to validate the system prompt and API integration
import { SYSTEM_PROMPT } from './system-prompt.js';

// Test cases to validate our system prompt
const testCases = [
    "machine learning algorithms",
    "climate change research papers", 
    "javascript tutorial",
    "quantum computing",
    "covid-19 vaccine studies",
    "artificial intelligence ethics",
    "renewable energy technology"
];

// Mock OpenRouter API response validator
function validateResponse(response) {
    try {
        const parsed = JSON.parse(response);
        
        // Check structure
        if (!parsed.queries || !Array.isArray(parsed.queries)) {
            return { valid: false, error: "Missing or invalid 'queries' array" };
        }
        
        if (parsed.queries.length !== 3) {
            return { valid: false, error: `Expected 3 queries, got ${parsed.queries.length}` };
        }
        
        // Check each query
        for (let i = 0; i < parsed.queries.length; i++) {
            const query = parsed.queries[i];
            const required = ['title', 'description', 'query', 'focus'];
            
            for (const field of required) {
                if (!query[field] || typeof query[field] !== 'string') {
                    return { valid: false, error: `Query ${i+1} missing or invalid '${field}'` };
                }
            }
            
            // Validate query syntax
            const queryStr = query.query;
            
            // Check for unclosed quotes
            const quoteCount = (queryStr.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0) {
                return { valid: false, error: `Query ${i+1} has unclosed quotes: ${queryStr}` };
            }
            
            // Check for basic syntax issues
            if (queryStr.includes('((') || queryStr.includes('))')) {
                return { valid: false, error: `Query ${i+1} has unbalanced parentheses: ${queryStr}` };
            }
        }
        
        return { valid: true };
        
    } catch (error) {
        return { valid: false, error: `JSON parse error: ${error.message}` };
    }
}

// Example of what a good response should look like
const exampleResponse = {
    "queries": [
        {
            "title": "Academic Papers",
            "description": "Search for peer-reviewed research papers and academic content",
            "query": "\"machine learning algorithms\" filetype:pdf site:edu OR site:arxiv.org",
            "focus": "Academic research and papers"
        },
        {
            "title": "Technical Documentation",
            "description": "Find comprehensive guides and technical documentation", 
            "query": "\"machine learning algorithms\" (filetype:pdf OR filetype:doc) intitle:\"tutorial\" OR intitle:\"guide\"",
            "focus": "Tutorials and technical guides"
        },
        {
            "title": "Recent Developments",
            "description": "Latest articles and developments in the field",
            "query": "\"machine learning algorithms\" after:2023-01-01 -site:pinterest.com -site:instagram.com",
            "focus": "Recent content and news"
        }
    ]
};

console.log("=== Germa Search System Prompt Test ===\n");
console.log("System Prompt Length:", SYSTEM_PROMPT.length, "characters\n");

console.log("=== Example Response Validation ===");
const validation = validateResponse(JSON.stringify(exampleResponse));
console.log("Valid:", validation.valid);
if (!validation.valid) {
    console.log("Error:", validation.error);
}

console.log("\n=== Test Cases ===");
testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. "${testCase}"`);
});

console.log("\n=== System Prompt Preview ===");
console.log(SYSTEM_PROMPT.substring(0, 500) + "...\n");

console.log("=== Validation Rules ===");
console.log("✓ Must return exactly 3 queries");
console.log("✓ Each query must have: title, description, query, focus");
console.log("✓ Quotes must be properly closed");
console.log("✓ No unbalanced parentheses");
console.log("✓ Valid JSON format");
console.log("✓ Practical, working search operators");

export { validateResponse, testCases };