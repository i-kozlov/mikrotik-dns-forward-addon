# MikroTik DNS Forward Browser Extension

[Русская версия](README.ru.md)

Add DNS forward rules to MikroTik router with one click from any website.

## Features

- One-click DNS forward from browser toolbar
- Auto-extracts base domain from current tab
- Chrome (MV3) and Firefox (MV2) support

## Installation

### Chrome
**Install from Chrome Web Store:** [MikroTik DNS Forward](https://chromewebstore.google.com/detail/mikrotik-dns-forward/eigednjnnheknamnhlphkmedkccmkkbk)

**Or install manually:**
1. `chrome://extensions/` → Enable "Developer mode"
2. "Load unpacked" → select extension folder

### Firefox
**Install from Firefox Add-ons:** [MikroTik DNS Forward](https://addons.mozilla.org/firefox/addon/mikrotik-dns-forward/)

**Or install manually:**
1. `about:debugging#/runtime/this-firefox`
2. "Load Temporary Add-on" → select `manifest.firefox.json`

## Configuration

1. Click extension icon → "Open Settings"
2. Fill in:
   - **Router URL:** `http://192.168.88.1`
   - **Username/Password:** MikroTik credentials
   - **Forward To:** target DNS (e.g., [`MihomoProxyRoS`](https://github.com/Medium1992/mihomo-proxy-ros/blob/main/README.md))
   - **Comment:** optional identifier
3. "Test Connection" → "Save Settings"

## MikroTik Setup

Enable REST API:
```routeros
/ip service set www disabled=no port=80
```

Create dedicated user (recommended):
```routeros
/user group set api policy=read,write,rest-api,api
/user add name=dns-api password=SECURE_PASSWORD group=api
```

## Usage

1. Visit any website
2. Click extension icon
3. Click "Add to MikroTik"

## Build

```bash
./build.sh
```
Creates `dist/mikrotik-dns-forward-chrome.zip` and `dist/mikrotik-dns-forward-firefox.xpi`

## License

MIT
