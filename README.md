# Germa Search - Intelligent Google Dorks Extension

Germa Search brings back precise, old-school search results by leveraging AI-powered Google Dorks. Get exactly what you're looking for without SEO spam, AI-generated fluff, or sponsored content.

## Features

- 🎯 **AI-Powered Search Optimization**: Uses advanced AI to generate 3 different search strategies for every query
- 📚 **Academic Focus**: Optimized for finding research papers, documents, and quality content
- ⚡ **Multiple Search Strategies**: Each search provides 3 different approaches (Academic, Technical, Recent)
- 🔍 **Universal Compatibility**: Works with Google, Bing, DuckDuckGo, and other search engines
- 🚀 **Fast & Lightweight**: Minimal resource usage with intelligent caching

## Installation

### 1. Install Extension
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked" and select the extension folder
5. The extension will replace your new tab page

### 2. Get Your Free API Key
1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account (no credit card required)
3. Navigate to the "Keys" section
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-...`)

### 3. Setup in Extension
1. Open a new tab - Germa Search will appear
2. You'll see an API key setup screen
3. Enter your OpenRouter API key
4. Click "Save & Start Searching"
5. Start using the extension immediately!

## How It Works

1. **Enter your search query** - Type what you're looking for (e.g., "machine learning research papers")
2. **AI generates optimized queries** - Our system creates 3 different search strategies using Google Dorks
3. **Choose your approach** - Click on any of the 3 generated queries to search
4. **Get precise results** - Opens in a new tab with highly targeted search results

## Example Search Strategies

For a search like "climate change research":

**Strategy 1: Academic Papers**
```
"climate change research" filetype:pdf site:edu OR site:arxiv.org
```

**Strategy 2: Technical Documentation**
```
"climate change research" (filetype:pdf OR filetype:doc) intitle:"study" OR intitle:"analysis"
```

**Strategy 3: Recent Developments**
```
"climate change research" after:2023-01-01 -site:pinterest.com -site:instagram.com
```

## Supported Search Operators

The extension uses universally compatible Google Dorks:

- `"exact phrase"` - Search for exact phrases
- `site:domain.com` - Search within specific sites
- `filetype:pdf` - Find specific file types
- `intitle:"keyword"` - Search in page titles
- `inurl:keyword` - Search in URLs
- `before:YYYY-MM-DD` - Results before date
- `after:YYYY-MM-DD` - Results after date
- `OR` / `AND` - Boolean operators
- `-term` - Exclude terms
- `*` - Wildcard operator

## AI Models

The extension uses **Mistral Small 3.2 24B** by default for optimal performance:
- 24B parameters for complex reasoning
- Excellent instruction following
- Strong structured output capabilities
- 131K context window
- Free tier available on OpenRouter

Alternative models available in settings:
- Gemini 2.0 Flash Experimental
- Qwen 3 4B
- GPT OSS 20B

## Privacy & Security

- ✅ API key stored locally in browser
- ✅ No data sent to our servers
- ✅ Direct communication with OpenRouter API
- ✅ No tracking or analytics
- ✅ Open source code

## Troubleshooting

### "API key not found" error
- Go to extension options and enter your OpenRouter API key
- Make sure the key starts with `sk-or-v1-`

### "No results" or weird queries
- The AI occasionally generates overly specific queries
- Try a different strategy from the 3 options provided
- Simplify your search terms

### Extension not loading
- Check if Developer mode is enabled in Chrome extensions
- Reload the extension from `chrome://extensions/`
- Check browser console for errors

## Development

### Project Structure
```
germa-search/
├── manifest.json          # Extension manifest
├── newtab.html           # New tab page UI
├── newtab.js             # Main application logic
├── styles.css            # Styling
├── api.js                # OpenRouter API integration
├── system-prompt.js      # AI system prompt
├── options.html          # Settings page
├── options.js            # Settings logic
└── README.md            # This file
```

### Local Development
1. Clone the repository
2. Make changes to the code
3. Go to `chrome://extensions/`
4. Click the refresh icon on the Germa Search extension
5. Open a new tab to test changes

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Ideas for Contributions
- Additional search engines support
- More sophisticated query generation
- User interface improvements
- Performance optimizations
- Additional AI model support

## License

MIT License - feel free to use and modify as needed.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Make sure your OpenRouter API key is valid and has credits

---

**Bringing back the golden age of search, one dork at a time.** 🔍✨