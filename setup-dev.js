// Quick development setup script
// This will automatically configure your extension with the API key from .env

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvKey() {
    try {
        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');

        const keyLine = envContent.split('\n').find(line => line.startsWith('OPENROUTER_KEY='));
        if (keyLine) {
            return keyLine.split('=')[1].trim();
        }

        return null;
    } catch (error) {
        console.error('Error reading .env file:', error);
        return null;
    }
}

function updateApiFile(apiKey) {
    try {
        const apiPath = path.join(__dirname, 'api.js');
        let apiContent = fs.readFileSync(apiPath, 'utf8');

        // Replace the development key line
        const oldLine = "        this.developmentApiKey = null;";
        const newLine = `        this.developmentApiKey = '${apiKey}';`;

        apiContent = apiContent.replace(oldLine, newLine);

        fs.writeFileSync(apiPath, apiContent, 'utf8');
        console.log('✅ API key configured in api.js');

    } catch (error) {
        console.error('Error updating api.js:', error);
    }
}

function main() {
    console.log('🔧 Setting up Germa Search for development...');

    const apiKey = loadEnvKey();
    if (!apiKey) {
        console.error('❌ OPENROUTER_KEY not found in .env file');
        return;
    }

    console.log('🔑 Found API key:', apiKey.substring(0, 20) + '...');

    updateApiFile(apiKey);

    console.log('\n✅ Development setup complete!');
    console.log('\nNext steps:');
    console.log('1. Load the extension in Chrome (chrome://extensions/)');
    console.log('2. Enable Developer mode');
    console.log('3. Click "Load unpacked" and select this folder');
    console.log('4. Open a new tab to test Germa Search');
    console.log('\n🚀 Happy searching!');
}

main();