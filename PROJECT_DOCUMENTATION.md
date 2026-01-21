# MikroTik DNS Forward Extension - Project Documentation

## Project Overview

### What We're Doing

This is a **browser extension** (Chrome/Firefox compatible) that allows users to quickly add DNS forward rules to their MikroTik router directly from any website they're browsing.

**Core Functionality:**
1. User browses to any website (e.g., github.com)
2. User clicks extension icon in browser toolbar
3. Extension extracts the base domain (github.com)
4. User can edit the domain if needed
5. User clicks "Add to MikroTik"
6. Extension sends API request to MikroTik router
7. DNS forward rule is created on the router

**Use Case:**
When you visit a website and want to route that domain through a specific DNS server (e.g., a proxy or custom DNS resolver), you can add it with one click instead of:
- Opening MikroTik WebFig/Winbox
- Navigating to IP → DNS → Static
- Manually adding the domain

### Technology Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Browser API:** WebExtensions API (Chrome/Firefox compatible)
- **Backend:** MikroTik RouterOS REST API
- **Architecture:** Client-side only (no server needed)

### Key Features

1. ✅ One-click DNS forward rule creation
2. ✅ Automatic domain extraction from current browser tab
3. ✅ Editable domain field before submission
4. ✅ Configurable MikroTik connection settings
5. ✅ Support for HTTP and HTTPS connections
6. ✅ Connection testing before use
7. ✅ Visual feedback (notifications, status messages)
8. ✅ Security recommendations (dedicated API user)

---

## MikroTik REST API Integration

### API Documentation

MikroTik RouterOS includes a REST API accessible via HTTP/HTTPS on the router.

**Base URL Format:**
```
http://{router-ip}/rest/{command-path}
https://{router-ip}/rest/{command-path}
```

**Authentication:**
- Type: HTTP Basic Auth
- Header: `Authorization: Basic base64(username:password)`

### API Calls and Responses

#### 1. Test Connection - Get System Identity

**Purpose:** Verify credentials and connection

**Request:**
```http
GET /rest/system/identity HTTP/1.1
Host: 192.168.88.1
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

**Success Response (HTTP 200):**
```json
{
    "name": "RB450Gx4@kigor"
}
```

**Authentication Failed (HTTP 401):**
```json
{
    "error": 401,
    "message": "Unauthorized"
}
```

**Access Denied (HTTP 403):**
```json
{
    "error": 403,
    "message": "Forbidden"
}
```

---

#### 2. Add DNS Forward Rule

**Purpose:** Create a DNS static entry with forward-to target

**Request:**
```http
POST /rest/ip/dns/static/add HTTP/1.1
Host: 192.168.88.1
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
Content-Type: application/json

{
    "name": "example.com",
    "forward-to": "MihomoProxyRoS",
    "comment": "_my"
}
```

**Success Response (HTTP 200):**
```json
{
    "ret": "*462"
}
```
*Note: `ret` contains the internal ID of the created entry (can be ignored)*

**Entry Already Exists (HTTP 400):**
```json
{
    "detail": "failure: entry already exists",
    "error": 400,
    "message": "Bad Request"
}
```

**Authentication Failed (HTTP 401):**
```json
{
    "error": 401,
    "message": "Unauthorized"
}
```

---

#### 3. List Existing DNS Static Entries

**Purpose:** View all DNS static entries (used for debugging)

**Request:**
```http
GET /rest/ip/dns/static HTTP/1.1
Host: 192.168.88.1
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

**Success Response (HTTP 200):**
```json
[
    {
        ".id": "*462",
        "name": "example.com",
        "forward-to": "MihomoProxyRoS",
        "comment": "_my",
        "disabled": "false"
    },
    {
        ".id": "*463",
        "name": "github.com",
        "forward-to": "MihomoProxyRoS",
        "comment": "_my",
        "disabled": "false"
    }
]
```

---

#### 4. Delete DNS Static Entry

**Purpose:** Remove a DNS forward rule by ID

**Request:**
```http
DELETE /rest/ip/dns/static/*462 HTTP/1.1
Host: 192.168.88.1
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

**Success Response (HTTP 200):**
```json
{}
```

---

## Architecture

### File Structure

```
mikrotik_dns_extension/
├── manifest.json          # Extension metadata and permissions
├── background.js          # Background service worker (API calls)
├── utils.js              # Shared utilities (domain parsing, validation)
├── popup/
│   ├── popup.html        # Extension popup UI
│   ├── popup.js          # Popup logic
│   └── popup.css         # Popup styling
├── options/
│   ├── options.html      # Settings page UI
│   ├── options.js        # Settings logic
│   └── options.css       # Settings styling
└── icons/
    ├── icon16.png        # Toolbar icon
    ├── icon48.png        # Extension management
    └── icon128.png       # Chrome Web Store
```

### Component Responsibilities

#### manifest.json
- Defines extension metadata (name, version, description)
- Declares required permissions (activeTab, storage, notifications)
- Specifies host permissions for API calls
- Configures popup and options pages

#### background.js (Service Worker)
- Handles API communication with MikroTik
- Processes messages from popup
- Manages HTTP requests to router
- Returns results to popup

#### popup/ (User Interface)
- **popup.html:** Main UI shown when clicking extension icon
- **popup.js:** 
  - Loads configuration from storage
  - Extracts domain from current tab
  - Sends add request to background script
  - Shows success/error messages
- **popup.css:** Styling for popup interface

#### options/ (Settings Page)
- **options.html:** Configuration form
- **options.js:**
  - Saves/loads settings from chrome.storage
  - Validates configuration
  - Tests connection to router
  - Parses identity response
- **options.css:** Styling for settings page

#### utils.js (Shared Code)
- `getBaseDomain(url)`: Extracts base domain from URL
  - Removes `www.` prefix
  - Extracts base domain from subdomains
  - Example: `api.github.com` → `github.com`
- `validateConfig(config)`: Validates configuration object
  - Checks URL format (must start with http/https)
  - Validates required fields

---

## Data Flow

### 1. Configuration Setup
```
User → Options Page → Save Config → chrome.storage.local
```

### 2. Adding DNS Forward
```
User clicks extension
    ↓
popup.js: Get current tab URL
    ↓
utils.js: Extract base domain
    ↓
popup.html: Display domain (editable)
    ↓
User clicks "Add to MikroTik"
    ↓
popup.js: Send message to background
    ↓
background.js: Make POST to /rest/ip/dns/static/add
    ↓
MikroTik Router: Process request
    ↓
background.js: Receive response
    ↓
popup.js: Show success/error notification
```

### 3. Test Connection
```
User clicks "Test Connection"
    ↓
options.js: Make GET to /rest/system/identity
    ↓
MikroTik Router: Return identity or 401 error
    ↓
options.js: Parse response
    ↓
Display: Success with router name OR authentication error
```

---

## Configuration Format

Settings are stored in browser's local storage:

```javascript
{
  "config": {
    "mikrotik": {
      "url": "http://192.168.88.1",
      "username": "dns-api",
      "password": "secure-password-here"
    },
    "dns": {
      "forwardTo": "MihomoProxyRoS",
      "comment": "_my"
    }
  }
}
```

---

## Security Considerations

### 1. Password Storage
- Passwords stored in `chrome.storage.local` (not synced to cloud)
- Browser extension storage is isolated from websites
- Still visible if someone has access to browser profile

### 2. Recommended: Dedicated User
Instead of using admin credentials, create a dedicated user:

```routeros
/user add name=dns-api password=long-random-password group=write \
  address=192.168.99.0/24 comment="DNS API access only"
```

**Benefits:**
- Limited permissions (only `write` group, not `full`)
- Can be easily revoked if compromised
- Password stored in browser is less critical
- Can restrict by source IP address

### 3. HTTPS Recommendation
Use HTTPS when possible to encrypt credentials in transit:
```routeros
/ip service set www-ssl disabled=no port=443
```

---

## Error Handling

### Connection Errors
| Error | Meaning | Solution |
|-------|---------|----------|
| `Failed to fetch` | Cannot reach router | Check URL, network connection |
| HTTP 401 | Wrong username/password | Verify credentials |
| HTTP 403 | User lacks permissions | Check user group |
| HTTP 400 "already exists" | Domain already in DNS | Informational, not an error |
| CORS error | Browser blocking request | Enable CORS on router or use localhost |

---

## Development Workflow

### 1. Installation for Development

**Chrome:**
```
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder
```

**Firefox:**
```
1. Open about:debugging#/runtime/this-firefox
2. Click "Load Temporary Add-on"
3. Select manifest.json
```

### 2. Making Changes
```
1. Edit code
2. Go to chrome://extensions/
3. Click "Reload" button on extension
4. Test changes
```

### 3. Debugging
```
1. Right-click extension icon → Inspect popup
2. Check Console for errors
3. Check Network tab for API calls
4. Use console.log() for debugging
```

---

## Future Enhancements

### Possible Features
- [ ] List existing DNS entries in popup
- [ ] Delete DNS entries from extension
- [ ] Bulk import domains from file
- [ ] Multiple router support
- [ ] Keyboard shortcuts
- [ ] Dark mode
- [ ] Export/import configuration
- [ ] Domain whitelist/blacklist patterns
- [ ] Auto-add based on URL patterns

---

## Troubleshooting

### "Configuration required" on popup
→ Open extension options and fill in all settings

### "Authentication failed" error
→ Check username and password in settings
→ Try "Test Connection" button
→ Verify user exists on router: `/user print`

### "Already exists" warning
→ Domain already has a forward rule
→ Check: `/ip dns static print where name~"domain.com"`

### Extension doesn't appear
→ Enable Developer mode
→ Check browser console for errors
→ Reload extension

### API calls fail with CORS error
→ MikroTik REST API may have CORS restrictions
→ Extension needs proper host_permissions in manifest

---

## MikroTik Router Setup

### 1. Enable REST API
```routeros
/ip service set www-ssl disabled=no port=443
# OR for HTTP only:
/ip service set www disabled=no port=80
```

### 2. Create API User (Recommended)
```routeros
/user add name=dns-api password=YOUR-SECURE-PASSWORD group=write \
  comment="Browser extension DNS API access"
```

### 3. Verify User
```routeros
/user print detail where name=dns-api
```

### 4. Test API Manually
```bash
# Test authentication
curl -k -u dns-api:password http://192.168.88.1/rest/system/identity

# Add DNS entry
curl -k -u dns-api:password \
  -X POST \
  http://192.168.88.1/rest/ip/dns/static/add \
  -H "Content-Type: application/json" \
  -d '{"name":"test.com","forward-to":"8.8.8.8","comment":"_test"}'
```

---

## License

MIT License - Free to use, modify, and distribute.

---

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Test API calls manually with curl
4. Check MikroTik RouterOS version compatibility
