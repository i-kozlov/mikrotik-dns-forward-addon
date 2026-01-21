# MikroTik DNS Forward Browser Extension

Quickly add DNS forward rules to your MikroTik router from any website you're browsing.

## Features

- Add DNS forward entries with one click from browser toolbar
- Automatically extracts base domain from current tab
- Configurable MikroTik router connection (HTTP/HTTPS)
- Support for custom DNS forward targets and comments
- Works in both Chrome and Firefox

## Installation

### Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `mikrotik-dns-forward` folder
5. Extension icon will appear in toolbar

### Firefox

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to `mikrotik-dns-forward` folder and select `manifest.json`
4. Extension icon will appear in toolbar

## Configuration

Before using the extension, you need to configure it:

1. Click the extension icon in toolbar
2. Click "Open Settings" button
3. Fill in the configuration:

**MikroTik Router:**
- Router URL: `http://192.168.88.1` (include http:// or https://)
- Username: your MikroTik username
- Password: your MikroTik password

**DNS Forward:**
- Forward To: target DNS server name (e.g., `MihomoProxyRoS`)
- Comment: identifier for DNS entries (e.g., `_my`)

4. Click "Test Connection" to verify settings
5. Click "Save Settings"

## MikroTik Setup

Enable REST API on your MikroTik router:

```routeros
/ip service set www-ssl disabled=no port=443
```

### Security: Create Dedicated User

**Highly recommended:** Create a dedicated user with limited permissions for the DNS API:

```routeros
# Create user with write permissions for DNS only
/user add name=dns-api password=long-random-password group=write \
  address=192.168.99.0/24 comment="DNS API access only"
```

Then use `dns-api` as the username in extension settings instead of your admin account.

**Why this matters:**
- Limits blast radius if credentials are compromised
- Password stored in browser is less sensitive
- Can be easily revoked: `/user remove dns-api`
- Restricts access to specific network range

## Usage

1. Navigate to any website
2. Click the extension icon in toolbar
3. Extension shows the base domain that will be added
4. Click "Add to MikroTik"
5. Success notification will appear

## Domain Extraction

The extension automatically:
- Removes `www.` prefix
- Extracts base domain (e.g., `api.github.com` → `github.com`)

## Security Notes

⚠️ **Password Storage:**
- Password is stored locally in browser storage
- Not synced to cloud
- Consider using a dedicated MikroTik user with limited permissions

## API Response Handling

- **Success:** Domain added, notification shown
- **Already exists:** Warning displayed, no action taken
- **Other errors:** Error message shown with details

## Requirements

- MikroTik RouterOS with REST API enabled
- Chrome 88+ or Firefox 78+
- Network access to MikroTik router

## Development

Structure:
```
mikrotik-dns-forward/
├── manifest.json          # Extension manifest
├── background.js          # API communication
├── utils.js              # Domain parsing
├── popup/
│   ├── popup.html        # Main UI
│   ├── popup.js          # Popup logic
│   └── popup.css         # Styling
├── options/
│   ├── options.html      # Settings page
│   ├── options.js        # Settings logic
│   └── options.css       # Settings styling
└── icons/                # Extension icons
```

## Troubleshooting

**"Configuration required" error:**
- Open settings and fill in all fields
- Click "Test Connection" to verify

**"Connection failed" error:**
- Check MikroTik URL is correct (include protocol)
- Verify username/password
- Ensure REST API is enabled on router
- Check network connectivity to router

**"Already exists" warning:**
- Domain already has a forward rule
- Check MikroTik DNS static entries

## License

MIT License - feel free to modify and distribute.
