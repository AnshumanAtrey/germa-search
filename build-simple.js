#!/usr/bin/env node

// Simple Build Script for Germa Search Extension
// Creates production-ready files for Chrome Web Store

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Germa Search Extension Build...');

// Configuration
const buildDir = path.join(__dirname, 'build');
const distDir = path.join(__dirname, 'dist');

const productionFiles = [
    'manifest.json',
    'newtab.html',
    'newtab.js',
    'api.js',
    'system-prompt.js',
    'styles.css',
    'options.html',
    'options.js',
    'icons',
    'README.md'
];

// Helper functions
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function copyDirectory(source, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    
    for (const file of files) {
        const sourcePath = path.join(source, file);
        const destPath = path.join(dest, file);
        const stat = fs.statSync(sourcePath);
        
        if (stat.isDirectory()) {
            copyDirectory(sourcePath, destPath);
        } else {
            fs.copyFileSync(sourcePath, destPath);
        }
    }
}

// Build steps
try {
    // 1. Clean build directories
    log('🧹 Cleaning build directories...');
    if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
    }
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(buildDir, { recursive: true });
    fs.mkdirSync(distDir, { recursive: true });
    log('✅ Build directories cleaned', 'success');

    // 2. Validate manifest
    log('📋 Validating manifest.json...');
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    if (!manifest.name || !manifest.version || !manifest.description) {
        throw new Error('Missing required manifest fields');
    }
    log(`✅ Manifest validated - v${manifest.version}`, 'success');

    // 3. Copy production files
    log('📁 Copying production files...');
    let copiedFiles = 0;
    
    for (const file of productionFiles) {
        const sourcePath = path.join(__dirname, file);
        const destPath = path.join(buildDir, file);
        
        if (fs.existsSync(sourcePath)) {
            const stat = fs.statSync(sourcePath);
            
            if (stat.isDirectory()) {
                copyDirectory(sourcePath, destPath);
                copiedFiles++;
            } else {
                fs.mkdirSync(path.dirname(destPath), { recursive: true });
                fs.copyFileSync(sourcePath, destPath);
                copiedFiles++;
            }
        } else {
            log(`⚠️  File not found: ${file}`, 'warning');
        }
    }
    log(`✅ Copied ${copiedFiles} files/directories`, 'success');

    // 4. Clean production files
    log('🔧 Cleaning production files...');
    
    // Clean api.js
    const apiJsPath = path.join(buildDir, 'api.js');
    if (fs.existsSync(apiJsPath)) {
        let apiContent = fs.readFileSync(apiJsPath, 'utf8');
        
        // Ensure development API key is null
        apiContent = apiContent.replace(
            /this\.developmentApiKey = '[^']*';/g,
            'this.developmentApiKey = null;'
        );
        
        // Remove console.log statements
        apiContent = apiContent.replace(/console\.log\([^)]*\);?\n?/g, '');
        
        fs.writeFileSync(apiJsPath, apiContent);
    }
    
    // Clean newtab.js
    const newtabJsPath = path.join(buildDir, 'newtab.js');
    if (fs.existsSync(newtabJsPath)) {
        let newtabContent = fs.readFileSync(newtabJsPath, 'utf8');
        newtabContent = newtabContent.replace(/console\.log\([^)]*\);?\n?/g, '');
        fs.writeFileSync(newtabJsPath, newtabContent);
    }
    
    log('✅ Production files cleaned', 'success');

    // 5. Create build info
    log('📊 Creating build info...');
    const buildInfo = {
        buildTime: new Date().toISOString(),
        version: manifest.version,
        name: manifest.name,
        description: manifest.description,
        files: productionFiles.filter(file => fs.existsSync(path.join(__dirname, file)))
    };
    
    fs.writeFileSync(
        path.join(distDir, 'build-info.json'),
        JSON.stringify(buildInfo, null, 2)
    );

    // 6. Copy build to dist for easy access
    log('📦 Creating distribution package...');
    const distBuildDir = path.join(distDir, `germa-search-v${manifest.version}`);
    copyDirectory(buildDir, distBuildDir);
    
    log('✅ Distribution package created', 'success');

    // Success message
    log('', 'info');
    log('🎉 BUILD COMPLETED SUCCESSFULLY!', 'success');
    log('', 'info');
    log('📋 Build Summary:', 'info');
    log(`   • Version: ${manifest.version}`, 'info');
    log(`   • Files: ${copiedFiles}`, 'info');
    log('', 'info');
    log('📁 Output locations:', 'info');
    log(`   • Build files: ${buildDir}`, 'info');
    log(`   • Distribution: ${distBuildDir}`, 'info');
    log('', 'info');
    log('🚀 Ready for Chrome Web Store!', 'success');
    log('💡 Manually zip the build/ folder for submission', 'info');

} catch (error) {
    log('', 'error');
    log('💥 BUILD FAILED!', 'error');
    log(`   Error: ${error.message}`, 'error');
    log('', 'error');
    process.exit(1);
}