// Development testing script - Node.js environment
// Run with: node dev-test.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });
        
        return envVars;
    } catch (error) {
        console.error('Error loading .env file:', error);
        return {};
    }
}

// Test the OpenRouter API with your key
async function testOpenRouterAPI() {
    const env = loadEnv();
    const apiKey = env.OPENROUTER_KEY;
    
    if (!apiKey) {
        console.error('OPENROUTER_KEY not found in .env file');
        return;
    }
    
    console.log('🔑 API Key loaded:', apiKey.substring(0, 20) + '...');
    
    const testQuery = "machine learning research papers";
    
    const systemPrompt = `You are an expert search query optimizer specializing in Google Dorks and advanced search operators. Your task is to transform user search queries into highly effective, precise search strings that work across all major search engines.

CRITICAL RULES:
1. ALWAYS return exactly 3 different search strategies in valid JSON format
2. Each query MUST be syntactically correct with properly closed quotes and operators
3. Use ONLY operators that work universally across search engines
4. Keep queries practical and not overly complex

RESPONSE FORMAT - Return ONLY valid JSON:
{
  "queries": [
    {
      "title": "Strategy Name",
      "description": "Brief explanation",
      "query": "actual search string",
      "focus": "what this targets"
    },
    {
      "title": "Strategy Name", 
      "description": "Brief explanation",
      "query": "actual search string",
      "focus": "what this targets"
    },
    {
      "title": "Strategy Name",
      "description": "Brief explanation", 
      "query": "actual search string",
      "focus": "what this targets"
    }
  ]
}`;

    const payload = {
        model: 'mistralai/mistral-small-3.2-24b-instruct-2506',
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: `Generate 3 optimized search queries for: "${testQuery}"`
            }
        ],
        temperature: 0.3,
        max_tokens: 1500
    };

    try {
        console.log('🚀 Testing OpenRouter API...');
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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
        
        console.log('✅ API Response received');
        console.log('📝 Raw content:', content);
        
        // Try to parse JSON
        try {
            const parsed = JSON.parse(content);
            console.log('✅ JSON parsed successfully');
            console.log('📊 Generated queries:');
            
            parsed.queries.forEach((query, index) => {
                console.log(`\n${index + 1}. ${query.title}`);
                console.log(`   Description: ${query.description}`);
                console.log(`   Query: ${query.query}`);
                console.log(`   Focus: ${query.focus}`);
            });
            
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError);
        }
        
    } catch (error) {
        console.error('❌ API Test Failed:', error);
    }
}

// Run the test
testOpenRouterAPI();