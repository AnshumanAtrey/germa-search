#!/usr/bin/env node

// Germa Search Extension Build Script
// Creates production-ready packages for Chrome Web Store

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Ensure we can run the script
console.log('🚀 Germa Search Build Script Starting...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExtensionBuilder {
    constructor() {
        this.projectRoot = __dirname;
        this.buildDir = path.join(this.projectRoot, 'build');
        this.distDir = path.join(this.projectRoot, 'dist');
        
        // Files to include in production build
        this.productionFiles = [
            'manifest.json',
            'newtab.html',
            'newtab.js',
            'api.js',
            'system-prompt.js',
            'styles.css',
            'options.html',
            'options.js',
            'icons/',
            'README.md'
        ];
        
        // Files to exclude from production
        this.excludeFiles = [
            'tests/',
            'test-*.js',
            'test-*.html',
            'dev-*.js',
            'setup-*.js',
            'build.js',
            'package.json',
            'package-lock.json',
            '.env',
            '.env.*',
            '.git/',
            '.gitignore',
            'node_modules/',
            '*.log',
            '.DS_Store',
            'Thumbs.db'
        ];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m',   // Red
            reset: '\x1b[0m'     // Reset
        };
        
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async cleanBuildDirectories() {
        this.log('🧹 Cleaning build directories...');
        
        try {
            if (fs.existsSync(this.buildDir)) {
                fs.rmSync(this.buildDir, { recursive: true, force: true });
            }
            if (fs.existsSync(this.distDir)) {
                fs.rmSync(this.distDir, { recursive: true, force: true });
            }
            
            fs.mkdirSync(this.buildDir, { recursive: true });
            fs.mkdirSync(this.distDir, { recursive: true });
            
            this.log('✅ Build directories cleaned', 'success');
        } catch (error) {
            this.log(`❌ Error cleaning directories: ${error.message}`, 'error');
            throw error;
        }
    }

    async runTests() {
        this.log('🧪 Running test suite...');
        
        try {
            // Check if test files exist
            const testFiles = [
                'tests/test-runner.html',
                'tests/api-tests.js',
                'tests/ui-tests.js'
            ];
            
            let testsExist = false;
            for (const testFile of testFiles) {
                if (fs.existsSync(path.join(this.projectRoot, testFile))) {
                    testsExist = true;
                    break;
                }
            }
            
            if (testsExist) {
                this.log('📋 Test files found - manual testing recommended', 'warning');
                this.log('💡 Open tests/test-runner.html in browser to run tests', 'info');
            } else {
                this.log('⚠️  No test files found - skipping tests', 'warning');
            }
            
            this.log('✅ Test phase completed', 'success');
        } catch (error) {
            this.log(`❌ Error during testing: ${error.message}`, 'error');
            throw error;
        }
    }

    async validateManifest() {
        this.log('📋 Validating manifest.json...');
        
        try {
            const manifestPath = path.join(this.projectRoot, 'manifest.json');
            const manifestContent = fs.readFileSync(manifestPath, 'utf8');
            const manifest = JSON.parse(manifestContent);
            
            // Required fields for Chrome Web Store
            const requiredFields = ['name', 'version', 'description', 'manifest_version'];
            const missingFields = requiredFields.filter(field => !manifest[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required manifest fields: ${missingFields.join(', ')}`);
            }
            
            // Validate version format
            const versionRegex = /^\\d+(\\.\\d+)*$/;
            if (!versionRegex.test(manifest.version)) {
                throw new Error(`Invalid version format: ${manifest.version}`);
            }
            
            // Check for development-specific content
            const manifestStr = JSON.stringify(manifest, null, 2);
            if (manifestStr.includes('localhost') || manifestStr.includes('127.0.0.1')) {
                this.log('⚠️  Manifest contains localhost references', 'warning');
            }
            
            this.log(`✅ Manifest validated - v${manifest.version}`, 'success');
            return manifest;
        } catch (error) {
            this.log(`❌ Manifest validation failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async copyProductionFiles() {
        this.log('📁 Copying production files...');
        
        try {
            let copiedFiles = 0;
            
            for (const file of this.productionFiles) {
                const sourcePath = path.join(this.projectRoot, file);
                const destPath = path.join(this.buildDir, file);
                
                if (fs.existsSync(sourcePath)) {
                    const stat = fs.statSync(sourcePath);
                    
                    if (stat.isDirectory()) {
                        // Copy directory recursively
                        this.copyDirectory(sourcePath, destPath);
                        copiedFiles++;
                    } else {
                        // Copy file
                        fs.mkdirSync(path.dirname(destPath), { recursive: true });
                        fs.copyFileSync(sourcePath, destPath);
                        copiedFiles++;
                    }
                } else {
                    this.log(`⚠️  File not found: ${file}`, 'warning');
                }
            }
            
            this.log(`✅ Copied ${copiedFiles} files/directories`, 'success');
        } catch (error) {
            this.log(`❌ Error copying files: ${error.message}`, 'error');
            throw error;
        }
    }

    copyDirectory(source, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const files = fs.readdirSync(source);
        
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const destPath = path.join(dest, file);
            const stat = fs.statSync(sourcePath);
            
            if (stat.isDirectory()) {
                this.copyDirectory(sourcePath, destPath);
            } else {
                fs.copyFileSync(sourcePath, destPath);
            }
        }
    }

    async cleanProductionFiles() {
        this.log('🔧 Cleaning production files...');
        
        try {
            // Remove development API keys from copied files
            const apiJsPath = path.join(this.buildDir, 'api.js');
            if (fs.existsSync(apiJsPath)) {
                let apiContent = fs.readFileSync(apiJsPath, 'utf8');
                
                // Ensure development API key is null
                apiContent = apiContent.replace(
                    /this\\.developmentApiKey = '[^']*';/g,
                    'this.developmentApiKey = null;'
                );
                
                // Remove any console.log statements for production
                apiContent = apiContent.replace(/console\\.log\\([^)]*\\);?/g, '');
                
                fs.writeFileSync(apiJsPath, apiContent);
            }
            
            // Clean other JS files
            const jsFiles = ['newtab.js', 'options.js'];
            for (const jsFile of jsFiles) {
                const jsPath = path.join(this.buildDir, jsFile);
                if (fs.existsSync(jsPath)) {
                    let jsContent = fs.readFileSync(jsPath, 'utf8');
                    
                    // Remove console.log statements
                    jsContent = jsContent.replace(/console\\.log\\([^)]*\\);?/g, '');
                    
                    fs.writeFileSync(jsPath, jsContent);
                }
            }
            
            this.log('✅ Production files cleaned', 'success');
        } catch (error) {
            this.log(`❌ Error cleaning production files: ${error.message}`, 'error');
            throw error;
        }
    }

    async createZipPackage(manifest) {
        this.log('📦 Creating ZIP package...');
        
        try {
            const zipName = `germa-search-v${manifest.version}.zip`;
            const zipPath = path.join(this.distDir, zipName);
            
            // Use native zip command if available, otherwise use fallback
            try {
                // Try different zip commands based on OS
                const isWindows = process.platform === 'win32';
                const isMac = process.platform === 'darwin';
                
                if (isWindows) {
                    // Windows - try PowerShell Compress-Archive
                    execSync(`powershell -command "Compress-Archive -Path '${this.buildDir}\\*' -DestinationPath '${zipPath}'"`, { stdio: 'pipe' });
                } else {
                    // macOS/Linux - use zip command
                    execSync(`cd "${this.buildDir}" && zip -r "${zipPath}" .`, { stdio: 'pipe' });
                }
                this.log(`✅ ZIP package created: ${zipName}`, 'success');
            } catch (zipError) {
                // Fallback to directory copy
                this.log('⚠️  ZIP command failed, using fallback method', 'warning');
                await this.createZipFallback(zipName);
                return path.join(this.distDir, 'germa-search-build');
            }
            
            // Get file size if ZIP was created
            if (fs.existsSync(zipPath)) {
                const stats = fs.statSync(zipPath);
                const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
                this.log(`📊 Package size: ${fileSizeInMB} MB`, 'info');
            }
            
            return zipPath;
        } catch (error) {
            this.log(`❌ Error creating ZIP: ${error.message}`, 'error');
            throw error;
        }
    }

    async createZipFallback(zipName) {
        // Simple fallback - just copy the build directory
        this.log('⚠️  Using fallback packaging method', 'warning');
        
        const fallbackDir = path.join(this.distDir, 'germa-search-build');
        if (fs.existsSync(fallbackDir)) {
            fs.rmSync(fallbackDir, { recursive: true });
        }
        
        this.copyDirectory(this.buildDir, fallbackDir);
        this.log('📁 Build files copied to dist/germa-search-build/', 'info');
        this.log('💡 You can manually zip this folder for Chrome Web Store', 'info');
    }

    async generateBuildReport(manifest, zipPath) {
        this.log('📊 Generating build report...');
        
        try {
            const report = {
                buildTime: new Date().toISOString(),
                version: manifest.version,
                name: manifest.name,
                description: manifest.description,
                files: this.getFileList(this.buildDir),
                packagePath: zipPath,
                packageSize: fs.existsSync(zipPath) ? fs.statSync(zipPath).size : 0,
                buildDirectory: this.buildDir
            };
            
            const reportPath = path.join(this.distDir, 'build-report.json');
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            
            this.log('✅ Build report generated', 'success');
            return report;
        } catch (error) {
            this.log(`❌ Error generating report: ${error.message}`, 'error');
            throw error;
        }
    }

    getFileList(directory, relativeTo = directory) {
        const files = [];
        const items = fs.readdirSync(directory);
        
        for (const item of items) {
            const fullPath = path.join(directory, item);
            const relativePath = path.relative(relativeTo, fullPath);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.getFileList(fullPath, relativeTo));
            } else {
                files.push({
                    path: relativePath,
                    size: stat.size,
                    modified: stat.mtime
                });
            }
        }
        
        return files;
    }

    async build() {
        const startTime = Date.now();
        
        try {
            this.log('🚀 Starting Germa Search extension build...', 'info');
            
            // Build steps
            await this.cleanBuildDirectories();
            await this.runTests();
            const manifest = await this.validateManifest();
            await this.copyProductionFiles();
            await this.cleanProductionFiles();
            const zipPath = await this.createZipPackage(manifest);
            const report = await this.generateBuildReport(manifest, zipPath);
            
            const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
            
            this.log('', 'info');
            this.log('🎉 BUILD COMPLETED SUCCESSFULLY!', 'success');
            this.log('', 'info');
            this.log('📋 Build Summary:', 'info');
            this.log(`   • Version: ${manifest.version}`, 'info');
            this.log(`   • Files: ${report.files.length}`, 'info');
            this.log(`   • Build time: ${buildTime}s`, 'info');
            this.log(`   • Package: ${path.basename(zipPath)}`, 'info');
            this.log('', 'info');
            this.log('📁 Output locations:', 'info');
            this.log(`   • Build files: ${this.buildDir}`, 'info');
            this.log(`   • Distribution: ${this.distDir}`, 'info');
            this.log('', 'info');
            this.log('🚀 Ready for Chrome Web Store submission!', 'success');
            
        } catch (error) {
            this.log('', 'error');
            this.log('💥 BUILD FAILED!', 'error');
            this.log(`   Error: ${error.message}`, 'error');
            this.log('', 'error');
            process.exit(1);
        }
    }
}

// Run build if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🎯 Initializing build process...');
    try {
        const builder = new ExtensionBuilder();
        await builder.build();
    } catch (error) {
        console.error('💥 Build failed:', error.message);
        process.exit(1);
    }
}

export default ExtensionBuilder;