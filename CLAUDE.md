# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser extension (Chrome/Firefox) that adds DNS forward rules to MikroTik routers via REST API. Users click the extension icon on any website, and the current domain is automatically extracted and can be added as a DNS forward entry with one click.

## Technology Stack

- **Frontend:** Vanilla JavaScript, HTML, CSS
- **API:** WebExtensions API (Manifest V3), MikroTik RouterOS REST API
- **Build:** `build.sh` creates distribution packages in `dist/chrome/` and `dist/firefox/`

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

## Build Process

**CRITICAL:** After any file changes (code, manifest.json, i18n, etc.), always:

1. **Bump patch version** in both `manifest.json` and `manifest.firefox.json`
   - Example: `1.6.0` → `1.6.1` → `1.6.2`
   - This helps track whether the extension was updated in browser
2. **Run build script:**
   ```bash
   ./build.sh
   ```
3. **Reload in browser:** `chrome://extensions/` → Reload button

**Build outputs:**
- `dist/chrome/` - Chrome extension (also used for Edge, Brave)
- `dist/firefox/` - Firefox extension
- `dist/mikrotik-dns-forward-chrome.zip` - Chrome package
- `dist/mikrotik-dns-forward-firefox.xpi` - Firefox package

Without rebuilding, changes won't be visible in the browser.

## Release Notes / CHANGELOG

When writing release notes in `CHANGELOG.md`:
- **Focus on WHAT changed, not HOW it was implemented**
- Write for end users, not developers
- Avoid technical implementation details (e.g., "periodic check mechanism", "service worker-safe timeout")
- Keep entries concise and user-focused

### Categorizing Changes

**CRITICAL:** Compare feature branch against `main` branch, not within feature branch history.

- **Added** - Functionality that didn't exist in `main` at all
- **Changed** - Functionality that existed in `main` but was modified
- **Fixed** - Bugs that were discovered and fixed

**Example:**
```bash
# Check if feature existed in main
git show main:background.js | grep "featureName"
# If not found → "Added"
# If found but modified → "Changed"
```

**Good examples:**
- ✅ "Added: Auto-close timer (0-60 seconds)" — feature didn't exist in main
- ✅ "Changed: Default router URL from http to https" — setting existed, value changed
- ✅ "Fixed: Crash when extension not allowed in incognito"

**Bad examples:**
- ❌ "Changed: Auto-close timer from 6 to 0" — if timer didn't exist in main, this is "Added"
- ❌ "Periodic check mechanism (10-second intervals)" — too technical, focus on user benefit

## Development

### Load Extension for Testing

**Chrome:**
1. Run `./build.sh` first
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" → select `dist/chrome/` folder

**Firefox:**
1. Run `./build.sh` first
2. Open `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on" → select `dist/firefox/manifest.json`

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

## Chrome Manifest V3 Service Worker Patterns

### Timeout Limitations
Chrome service workers sleep after ~30 seconds of inactivity. Long `setTimeout` calls (>30s) may fail silently.

**Solution:** Chain short intervals (≤10 seconds):
```javascript
function scheduleWithChecks(targetTime) {
  function check() {
    const remaining = targetTime - Date.now();
    if (remaining <= 0) {
      // Execute action
    } else {
      setTimeout(check, Math.min(remaining, 10000));
    }
  }
  setTimeout(check, Math.min(targetTime - Date.now(), 10000));
}
```

### Incognito/Private Window Permissions
Extensions need explicit user permission for incognito access:
- **Chrome:** User must enable "Allow in Incognito" in `chrome://extensions/`
- **Firefox:** User must enable "Run in Private Windows" in add-ons manager

**API behavior:**
- `chrome.windows.create({ incognito: true })` returns `null` (not error) when permission denied
- Always check for `null` and provide clear error message

### Dual Manifest Architecture
**Chrome** (`manifest.json`):
- Manifest V3
- Service worker in `background.service_worker`
- No explicit incognito config needed

**Firefox** (`manifest.firefox.json`):
- Manifest V2 (MV3 has auth header bugs)
- Background scripts in `background.scripts`
- Requires `"incognito": "spanning"` for private window access
- Requires `"tabs"` permission for window manipulation

Build script (`build.sh`) copies appropriate manifest for each platform.

## Debugging

### Service Worker Logs
**Location:** `chrome://extensions/` → "Inspect views: service worker"

**NOT visible in:**
- Popup console (right-click icon → Inspect)
- Opened tabs (F12)
- Incognito windows

**Tip:** If service worker is "inactive", click the link to wake it and see logs.
