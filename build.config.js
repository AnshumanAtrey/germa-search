// Germa Search Build Configuration

export const buildConfig = {
    // Extension metadata
    name: 'Germa Search',
    version: '1.0.0',

    // Files to include in production build
    includeFiles: [
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
    ],

    // Files and patterns to exclude
    excludeFiles: [
        'tests/',
        'test-*.js',
        'test-*.html',
        'dev-*.js',
        'setup-*.js',
        'build.js',
        'build.config.js',
        'package.json',
        'package-lock.json',
        '.env',
        '.env.*',
        '.git/',
        '.gitignore',
        'node_modules/',
        '*.log',
        '.DS_Store',
        'Thumbs.db',
        '*.tmp',
        '*.temp'
    ],

    // Build options
    options: {
        // Remove console.log statements in production
        removeConsoleLog: true,

        // Clean development API keys
        cleanApiKeys: true,

        // Validate manifest before build
        validateManifest: true,

        // Run tests before build
        runTests: false, // Set to true if you want automated testing

        // Create ZIP package
        createZip: true,

        // Generate build report
        generateReport: true
    },

    // Chrome Web Store specific settings
    webStore: {
        // Maximum package size (in MB)
        maxPackageSize: 128,

        // Required manifest fields
        requiredManifestFields: [
            'name',
            'version',
            'description',
            'manifest_version',
            'permissions'
        ]
    }
};

export default buildConfig;