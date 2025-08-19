# Germa Search - Build Guide

This guide explains how to build and package the Germa Search extension for distribution.

## 🚀 Quick Build

```bash
# Build the extension
npm run build

# Clean build (removes previous builds)
npm run build:clean

# Create release package
npm run release
```

## 📋 Build Process

The build script performs the following steps:

### 1. **Clean Build Directories** 🧹
- Removes previous `build/` and `dist/` directories
- Creates fresh build environment

### 2. **Run Tests** 🧪
- Validates test files exist
- Provides testing recommendations
- Can be configured to run automated tests

### 3. **Validate Manifest** 📋
- Checks required fields (`name`, `version`, `description`, etc.)
- Validates version format
- Warns about development-specific content

### 4. **Copy Production Files** 📁
- Copies only necessary files for production
- Excludes development and test files
- Preserves directory structure

### 5. **Clean Production Code** 🔧
- Removes development API keys
- Strips console.log statements
- Optimizes for production

### 6. **Create ZIP Package** 📦
- Creates Chrome Web Store compatible ZIP
- Names package with version number
- Reports package size

### 7. **Generate Build Report** 📊
- Creates detailed build report
- Lists all included files
- Records build metadata

## 📁 Output Structure

After building, you'll have:

```
build/                          # Clean production files
├── manifest.json
├── newtab.html
├── newtab.js
├── api.js
├── system-prompt.js
├── styles.css
├── options.html
├── options.js
├── icons/
└── README.md

dist/                           # Distribution packages
├── germa-search-v1.0.0.zip    # Chrome Web Store package
└── build-report.json          # Build metadata
```

## 🎯 Files Included in Build

### **Core Extension Files:**
- `manifest.json` - Extension configuration
- `newtab.html` - Main interface
- `newtab.js` - Application logic
- `api.js` - OpenRouter API integration
- `system-prompt.js` - AI prompt configuration
- `styles.css` - UI styling

### **Additional Files:**
- `options.html` - Settings page
- `options.js` - Settings logic
- `icons/` - Extension icons
- `README.md` - Documentation

## 🚫 Files Excluded from Build

### **Development Files:**
- `tests/` - Test suite
- `test-*.js` - Test files
- `dev-*.js` - Development scripts
- `setup-*.js` - Setup scripts
- `build.js` - Build script itself

### **Configuration Files:**
- `package.json` - Node.js configuration
- `.env` - Environment variables
- `.gitignore` - Git ignore rules

### **System Files:**
- `.DS_Store` - macOS system files
- `Thumbs.db` - Windows system files
- `*.log` - Log files

## ⚙️ Build Configuration

Edit `build.config.js` to customize the build process:

```javascript
export const buildConfig = {
    // Files to include/exclude
    includeFiles: [...],
    excludeFiles: [...],
    
    // Build options
    options: {
        removeConsoleLog: true,
        cleanApiKeys: true,
        validateManifest: true,
        runTests: false,
        createZip: true,
        generateReport: true
    }
};
```

## 🔍 Build Validation

The build process validates:

### **Manifest Requirements:**
- ✅ Required fields present
- ✅ Valid version format
- ✅ No localhost references
- ✅ Proper permissions

### **Code Quality:**
- ✅ No hardcoded API keys
- ✅ No development console logs
- ✅ Clean production code

### **Package Requirements:**
- ✅ Under 128MB size limit
- ✅ Chrome Web Store compatible
- ✅ All required files included

## 🚀 Chrome Web Store Submission

After building:

1. **Upload the ZIP file** from `dist/germa-search-v1.0.0.zip`
2. **Fill out store listing** with description and screenshots
3. **Set privacy policy** (if collecting data)
4. **Submit for review**

### **Store Listing Requirements:**
- **Name**: Germa Search
- **Description**: AI-powered Google Dorks extension for precise search results
- **Category**: Productivity
- **Screenshots**: Include main interface and settings
- **Privacy**: Explain API key usage

## 🐛 Troubleshooting

### **Build Fails:**
```bash
# Check Node.js version
node --version

# Clean and retry
npm run build:clean
```

### **Package Too Large:**
- Check `build-report.json` for file sizes
- Remove unnecessary files from `includeFiles`
- Optimize images in `icons/` directory

### **Manifest Errors:**
- Validate JSON syntax
- Check required fields
- Ensure version format is correct

### **Missing Files:**
- Check file paths in `build.config.js`
- Ensure files exist in project root
- Verify file permissions

## 📊 Build Reports

Each build generates a detailed report in `dist/build-report.json`:

```json
{
  "buildTime": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "name": "Germa Search",
  "files": [...],
  "packageSize": 1048576,
  "buildDirectory": "./build"
}
```

## 🔄 Continuous Integration

For automated builds, add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Build Extension
  run: npm run build

- name: Upload Package
  uses: actions/upload-artifact@v2
  with:
    name: germa-search-extension
    path: dist/*.zip
```

---

## 🎉 Ready for Distribution!

Once built, your extension is ready for:
- ✅ Chrome Web Store submission
- ✅ Enterprise distribution
- ✅ Side-loading for testing
- ✅ Public release

The build process ensures your extension meets all Chrome Web Store requirements and is optimized for production use.