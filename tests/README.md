# Germa Search Test Suite

Comprehensive testing framework for the Germa Search browser extension, covering all aspects from API integration to UI performance.

## 🧪 Test Structure

### Test Categories

1. **API Tests** (`api-tests.js`)
   - API key validation
   - OpenRouter connection testing
   - System prompt validation
   - Query generation logic
   - Error handling
   - Fallback mechanisms

2. **UI Tests** (`ui-tests.js`)
   - Search input validation
   - Button interactions
   - Loading states
   - Results display
   - Responsive design
   - Accessibility compliance

3. **Integration Tests** (`integration-tests.js`)
   - End-to-end user flows
   - Error recovery mechanisms
   - Data flow integrity
   - Chrome extension APIs

4. **Performance Tests** (`performance-tests.js`)
   - Page load performance
   - API response times
   - Memory usage monitoring
   - UI responsiveness

## 🚀 Running Tests

### Option 1: Visual Test Runner (Recommended)

Open `tests/test-runner.html` in your browser for a comprehensive visual test interface:

```bash
# From the project root
open tests/test-runner.html
```

Features:
- ✅ Industrial-themed UI matching the extension
- ✅ Real-time progress tracking
- ✅ Detailed test results with timing
- ✅ Individual test suite controls
- ✅ Performance metrics dashboard

### Option 2: Individual Test Suites

Run specific test categories:

```javascript
// API Tests
const apiTests = new ApiTestSuite();
await apiTests.runAllTests();

// UI Tests  
const uiTests = new UiTestSuite();
await uiTests.runAllTests();

// Integration Tests
const integrationTests = new IntegrationTestSuite();
await integrationTests.runAllTests();

// Performance Tests
const performanceTests = new PerformanceTestSuite();
await performanceTests.runAllTests();
```

### Option 3: Node.js Environment

For API and system prompt testing:

```bash
# Install dependencies (if using Node.js)
npm install

# Run API tests
node -e "
import('./api-tests.js').then(module => {
  const ApiTestSuite = module.default;
  const tests = new ApiTestSuite();
  tests.runAllTests();
});
"
```

## 📊 Test Coverage

### API Integration (api-tests.js)
- ✅ API key format validation
- ✅ OpenRouter endpoint connectivity
- ✅ Authentication testing
- ✅ System prompt structure validation
- ✅ Query generation logic
- ✅ Response parsing and validation
- ✅ Error handling scenarios
- ✅ Fallback query generation

### UI Components (ui-tests.js)
- ✅ Search input validation and sanitization
- ✅ Button click and keyboard interactions
- ✅ Loading state animations
- ✅ Results display and formatting
- ✅ Query card generation and click handlers
- ✅ Responsive design breakpoints
- ✅ Accessibility features (ARIA, keyboard nav)
- ✅ Color contrast compliance

### Integration Flows (integration-tests.js)
- ✅ Complete user journey simulation
- ✅ Search flow with multiple queries
- ✅ Result interaction and tab creation
- ✅ API failure recovery with fallbacks
- ✅ Network error handling
- ✅ Invalid response recovery
- ✅ Data sanitization and validation
- ✅ Chrome extension API integration

### Performance Metrics (performance-tests.js)
- ✅ Page load time measurement
- ✅ Asset loading optimization
- ✅ First Contentful Paint (FCP)
- ✅ API response latency
- ✅ Memory usage monitoring
- ✅ UI interaction responsiveness
- ✅ Animation performance (FPS)
- ✅ Scroll performance

## 🎯 Test Results Interpretation

### Performance Benchmarks

| Metric | Excellent | Good | Acceptable | Poor |
|--------|-----------|------|------------|------|
| Page Load | <500ms | <1000ms | <2000ms | >2000ms |
| API Response | <1000ms | <2000ms | <5000ms | >5000ms |
| Memory Usage | <20MB | <50MB | <100MB | >100MB |
| Interaction | <50ms | <100ms | <200ms | >200ms |

### Success Criteria

- **API Tests**: All authentication and query generation tests must pass
- **UI Tests**: 95%+ pass rate with all accessibility tests passing
- **Integration Tests**: All end-to-end flows must complete successfully
- **Performance Tests**: Must meet "Good" or better benchmarks

## 🔧 Test Configuration

### Environment Setup

The test suite automatically detects and adapts to different environments:

- **Browser Extension**: Uses Chrome APIs and extension context
- **Node.js**: Uses filesystem and network APIs
- **Browser**: Uses DOM APIs and performance monitoring

### Mock Data

Tests use realistic mock data that mirrors actual API responses:

```javascript
// Example mock query response
{
  "queries": [
    {
      "title": "Academic Papers",
      "description": "Search for peer-reviewed research papers",
      "query": "\"machine learning\" filetype:pdf site:edu",
      "focus": "Academic research"
    }
    // ... 2 more queries
  ]
}
```

### Test Data Validation

All test data is validated against the same schemas used in production:

- ✅ Query structure validation
- ✅ Response format checking
- ✅ Search operator syntax validation
- ✅ Input sanitization testing

## 🐛 Debugging Tests

### Common Issues

1. **API Key Not Found**
   ```
   Solution: Set OPENROUTER_KEY in .env or configure in extension options
   ```

2. **Network Timeouts**
   ```
   Solution: Check internet connection and OpenRouter service status
   ```

3. **Chrome API Errors**
   ```
   Solution: Ensure extension is loaded and has proper permissions
   ```

### Debug Mode

Enable detailed logging by setting debug flags:

```javascript
// In test-runner.js
const DEBUG_MODE = true;
const VERBOSE_LOGGING = true;
```

### Performance Profiling

Use browser dev tools alongside tests:

1. Open Chrome DevTools
2. Go to Performance tab
3. Start recording
4. Run performance tests
5. Analyze results

## 📈 Continuous Testing

### Automated Testing

Set up automated testing for CI/CD:

```bash
# Example GitHub Actions workflow
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Tests
        run: |
          npm install
          npm test
```

### Performance Monitoring

Track performance metrics over time:

- Load time trends
- Memory usage patterns
- API response time changes
- User interaction latency

## 🔍 Test Maintenance

### Adding New Tests

1. **Create test function** following naming convention
2. **Add to appropriate test suite** (API, UI, Integration, Performance)
3. **Update test runner** to include new tests
4. **Document expected behavior** and success criteria

### Updating Existing Tests

1. **Maintain backward compatibility** when possible
2. **Update mock data** to reflect API changes
3. **Adjust performance benchmarks** as needed
4. **Keep documentation current**

## 📝 Test Reports

### Automated Reports

Tests generate detailed reports including:

- ✅ Pass/fail status for each test
- ⏱️ Execution timing and performance metrics
- 📊 Memory usage and resource consumption
- 🔍 Detailed error messages and stack traces
- 📈 Performance trends and recommendations

### Manual Review

Regular manual testing should cover:

- Real API integration with actual keys
- Cross-browser compatibility
- Edge cases and error scenarios
- User experience validation

---

## 🎉 Contributing to Tests

When contributing new features:

1. **Write tests first** (TDD approach)
2. **Ensure comprehensive coverage** of new functionality
3. **Update performance benchmarks** if needed
4. **Document test scenarios** and expected outcomes
5. **Run full test suite** before submitting changes

The test suite is designed to grow with the extension and maintain high quality standards throughout development.