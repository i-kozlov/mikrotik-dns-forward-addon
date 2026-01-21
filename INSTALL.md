# Quick Installation Guide

## Chrome Installation

1. **Open Extensions Page:**
   - Go to `chrome://extensions/` in Chrome
   - Or click Menu → More Tools → Extensions

2. **Enable Developer Mode:**
   - Toggle "Developer mode" switch in top right corner

3. **Load Extension:**
   - Click "Load unpacked" button
   - Select this folder (`mikrotik-dns-forward`)
   - Extension will appear with blue "M" icon

4. **Configure:**
   - Click extension icon in toolbar
   - Click "Open Settings"
   - Fill in MikroTik configuration
   - Click "Test Connection" then "Save Settings"

## Firefox Installation

1. **Open Debugging Page:**
   - Type `about:debugging` in address bar
   - Click "This Firefox" in left sidebar

2. **Load Temporary Extension:**
   - Click "Load Temporary Add-on" button
   - Navigate to this folder and select `manifest.json`
   - Extension will appear in toolbar

3. **Configure:**
   - Click extension icon in toolbar
   - Click "Open Settings"
   - Fill in configuration and save

**Note:** In Firefox, temporary extensions are removed when browser closes. For permanent installation, the extension needs to be signed by Mozilla.

## First Time Setup

After installation, configure these settings:

### MikroTik Router Configuration
```
Router URL: http://192.168.88.1
Username: admin
Password: your-password
```

### DNS Forward Settings
```
Forward To: MihomoProxyRoS
Comment: _my
```

Click "Test Connection" to verify, then "Save Settings".

## Usage

1. Visit any website
2. Click extension icon
3. Verify domain is correct
4. Click "Add to MikroTik"
5. Done!

## Troubleshooting

**Extension doesn't appear:**
- Make sure Developer mode is enabled (Chrome)
- Check console for errors

**Can't connect to router:**
- Verify router URL includes `https://` or `http://`
- Check username and password
- Ensure REST API is enabled: `/ip service enable www-ssl`

**Domain already exists:**
- This is normal if you've added it before
- Check MikroTik: `/ip dns static print`
