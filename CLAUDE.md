# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser extension (Chrome/Firefox) that adds DNS forward rules to MikroTik routers via REST API. Users click the extension icon on any website, and the current domain is automatically extracted and can be added as a DNS forward entry with one click.

## Technology Stack

- **Frontend:** Vanilla JavaScript, HTML, CSS
- **API:** WebExtensions API (Manifest V3), MikroTik RouterOS REST API
- **No build step required** - plain JS files loaded directly by browser

## Architecture

```
manifest.json       → Extension config, permissions, entry points
background.js       → Service worker handling MikroTik API calls
utils.js            → Shared utilities (domain extraction, config validation)
popup/              → Main UI shown when clicking extension icon
options/            → Settings page for router credentials
```

**Data Flow:**
1. `popup.js` extracts domain from current tab URL using `utils.js`
2. User clicks "Add to MikroTik"
3. `popup.js` sends message to `background.js` with domain + config
4. `background.js` makes POST to `/rest/ip/dns/static/add`
5. Response returned to popup for user feedback

**Configuration stored in `chrome.storage.local`:**
```javascript
{
  config: {
    mikrotik: { url, username, password },
    dns: { forwardTo, comment }
  }
}
```

## Development

### Load Extension for Testing

**Chrome:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select this folder

**Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on" → select `manifest.json`

### Reload After Changes
Go to `chrome://extensions/` and click "Reload" on the extension.

### Debugging
- Right-click extension icon → "Inspect popup" for popup console
- Service worker logs visible in extension details → "Inspect views: service worker"

## MikroTik REST API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/rest/system/identity` | GET | Test connection, get router name |
| `/rest/ip/dns/static/add` | POST | Create DNS forward entry |

**Auth:** HTTP Basic (username:password base64 encoded)

**Request body for adding DNS entry:**
```json
{
  "name": "domain.com",
  "forward-to": "TargetDNS",
  "comment": "_my"
}
```

## Key Functions

- `getBaseDomain(url)` in `utils.js` - Extracts base domain, removes www prefix
- `validateConfig(config)` in `utils.js` - Validates configuration completeness
- `addDnsForward()` in `background.js` - Makes API call to router
