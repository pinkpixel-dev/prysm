![Prysm Logo](https://res.cloudinary.com/di7ctlowx/image/upload/v1743577195/logo_iu7ob8.png)

# 🔍 Prysm – Structure-Aware Web Scraper for Anything on the Internet

Prysm is a blazing-smart Puppeteer-based web scraper that doesn't just extract — it *understands* structure. From recipes and documentation to ecommerce listings and blogs, Prysm dynamically adapts to the page and gets what matters — fast.

---

## ⚡ Features

- 🧠 **AI-style Structure Detection**: Recipes, articles, docs, products, blogs — identified and extracted with precision.
- 🕵️‍♂️ **Cloudflare Bypass**: Defeats the orange wall with stealth plugins and anti-bot evasion.
- 🚫 **Resource Blocking**: Faster scrapes with image/script/fonts tracking turned off.
- 🔄 **Smart Pagination**: Scroll, click, or URL pattern — handled automatically or manually.
- 🧪 **Test Suite**: A built-in command-line test runner with category presets and results output.
- 🛠 **Pluggable & Modular**: Add your own extractors, test sites, or pagination styles in seconds.
- 🌐 **REST API**: OpenAPI-powered REST interface for remote control and integration.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run CLI test scraper
npm run start:cli all

# Start the REST API server
npm run start:api
```

## 🖥️ CLI Usage

The CLI provides a simple interface to run the scraper. Prysm automatically detects page structure and adapts its scraping strategy accordingly:

```bash
# Scrape any URL
npm run start:cli "https://example.com"

# Scrape with custom options
npm run start:cli "https://example.com" \
  --maxScrolls 10 \
  --scrollDelay 2000 \
  --bypassCloudflare \
  --handlePagination

# Scrape multiple pages by following links (defaults to same domain)
npm run start:cli "https://example.com" --pages 5

# Scrape with custom link selector (useful for specific content types)
npm run start:cli "https://example.com" --pages 3 --linkSelector ".article-link"

# Run test suite (includes various test sites)
npm run start:cli test
```

### CLI Options
- `--pages <number>` - Maximum number of pages to scrape (default: 1)
- `--linkSelector <selector>` - CSS selector for links to follow when using --pages
- `--allDomains` - Follow links to any domain (default: same domain only)
- `--maxScrolls <number>` - Maximum scroll attempts (default: 5)
- `--scrollDelay <ms>` - Delay between scrolls in ms (default: 2000)
- `--bypassCloudflare` - Enable Cloudflare bypass (default: true)
- `--handlePagination` - Auto-handle pagination (default: true)
- `--paginationStrategy <strategy>` - Force pagination strategy (infinite/click/url)
- `--headless` - Run in headless mode (default: true)
- `--noHeadless` - Run with browser visible
- `--output <path>` - Custom output path for results

Prysm will automatically:
- Detect page structure (article, recipe, product listing, etc.)
- Choose the best extraction strategy
- Handle pagination if present
- Bypass anti-bot protections when needed
- Block unnecessary resources for faster scraping
- Follow links to additional pages when --pages > 1

## 🌐 REST API

Prysm includes a full-featured REST API that allows you to:

- Start scraping jobs remotely
- Check job status and progress
- Retrieve scraped content
- Manage jobs (cancel, delete)
- Receive webhook notifications

### Available Endpoints

#### 1. Create Scraping Job
```bash
POST http://localhost:3001/api/jobs

# Request body:
{
  "url": "https://example.com/page-to-scrape",
  "options": {
    "maxScrolls": 5,                 # Optional: scroll attempts
    "scrollDelay": 2000,            # Optional: delay between scrolls (ms)
    "bypassCloudflare": true,       # Optional: bypass Cloudflare
    "handlePagination": true,       # Optional: auto-handle pagination
    "paginationStrategy": "infinite" # Optional: force pagination strategy
  }
}

# Response:
{
  "jobId": "job_xyz123",
  "status": "pending",
  "url": "https://example.com/page-to-scrape",
  "createdAt": "2024-03-20T10:30:00Z"
}
```

#### 2. Check Job Status
```bash
GET http://localhost:3001/api/jobs/{jobId}

# Response:
{
  "jobId": "job_xyz123",
  "status": "completed",
  "url": "https://example.com/page-to-scrape",
  "createdAt": "2024-03-20T10:30:00Z",
  "completedAt": "2024-03-20T10:31:00Z",
  "progress": 100
}
```

#### 3. Get Job Results
```bash
GET http://localhost:3001/api/jobs/{jobId}/results

# Response:
{
  "jobId": "job_xyz123",
  "status": "completed",
  "result": {
    "title": "Page Title",
    "content": ["..."],
    "metadata": {},
    "structureType": "article",
    "paginationType": "infinite",
    "extractionMethod": "ai"
  }
}
```

#### 4. List All Jobs
```bash
GET http://localhost:3001/api/jobs?status=completed&limit=20&offset=0

# Response:
{
  "jobs": [
    {
      "jobId": "job_xyz123",
      "status": "completed",
      "url": "https://example.com/page-to-scrape",
      "createdAt": "2024-03-20T10:30:00Z"
    }
    // ...
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

#### 5. Cancel/Delete Job
```bash
DELETE http://localhost:3001/api/jobs/{jobId}
```

### API Documentation UI
When running the API server, full OpenAPI/Swagger documentation is available at:
```
http://localhost:3001/api-docs
```

---

## 📁 Output

All results are saved in the `scraper/results` folder:
- CLI results in the `results` directory
- API job results in the `results/api` folder

---

## 📦 Structure

- `main_scraper.js` – The core scraper engine and CLI interface
- `mainExtractor.js` – Core multi-strategy extraction engine
- `cloudflareBypass.js` – Evasion tactics and header masking
- `paginationStrategies.js` – Infinite scroll, click-to-load, URL pagination
- `resourceBlocker.js` – Optional performance boost via request blocking
- `utils/helpers.js` – Common utility functions
- `api/` – REST API implementation with OpenAPI
- `CLI-USAGE.md` – Detailed CLI usage instructions
- `API-USAGE.md` – Detailed API usage instructions

---

## 🧬 Why Prysm?

Because scraping is more than grabbing HTML — it's about interpreting structure, dodging traps, and doing it at scale. Prysm gives you that edge.

---

## 🛡 Disclaimer

This project is for educational and ethical scraping only. Respect robots.txt and copyright laws.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the scraper:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

✨ Dream it, Pixel it | Made with ❤️ by Pink Pixel