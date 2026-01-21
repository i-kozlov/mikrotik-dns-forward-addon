# MikroTik REST API - Examples and Testing

This file contains practical examples for testing MikroTik REST API endpoints used by the extension.

## Prerequisites

1. MikroTik router with REST API enabled
2. Router accessible at http://192.168.88.1 (adjust as needed)
3. User credentials: username/password

## Testing Tools

### Option 1: curl (Command Line)
```bash
# Available on Linux, macOS, Windows (Git Bash, WSL)
curl --version
```

### Option 2: Postman
- GUI application for API testing
- Download: https://www.postman.com/downloads/

### Option 3: Browser DevTools
- Open extension → Inspect → Network tab
- See actual API calls from extension

---

## 1. Test Authentication & Get Router Identity

### curl Example

```bash
# Replace with your credentials
ROUTER_URL="http://192.168.88.1"
USERNAME="admin"
PASSWORD="your-password"

# Test connection
curl -X GET \
  "${ROUTER_URL}/rest/system/identity" \
  -u "${USERNAME}:${PASSWORD}" \
  -H "Content-Type: application/json"
```

### Expected Responses

**✅ Success (HTTP 200):**
```json
{
    "name": "RB450Gx4@kigor"
}
```

**❌ Wrong Password (HTTP 401):**
```json
{
    "error": 401,
    "message": "Unauthorized"
}
```

**❌ No Permissions (HTTP 403):**
```json
{
    "error": 403,
    "message": "Forbidden"
}
```

### Postman Setup

1. Method: GET
2. URL: `http://192.168.88.1/rest/system/identity`
3. Auth → Basic Auth
   - Username: admin
   - Password: your-password
4. Send

---

## 2. Add DNS Forward Rule

### curl Example

```bash
ROUTER_URL="http://192.168.88.1"
USERNAME="dns-api"
PASSWORD="your-password"
DOMAIN="example.com"
FORWARD_TO="MihomoProxyRoS"
COMMENT="_my"

curl -X POST \
  "${ROUTER_URL}/rest/ip/dns/static/add" \
  -u "${USERNAME}:${PASSWORD}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"${DOMAIN}\",
    \"forward-to\": \"${FORWARD_TO}\",
    \"comment\": \"${COMMENT}\"
  }"
```

### Expected Responses

**✅ Success (HTTP 200):**
```json
{
    "ret": "*462"
}
```
*The `ret` field contains the internal ID (can be ignored)*

**❌ Already Exists (HTTP 400):**
```json
{
    "detail": "failure: entry already exists",
    "error": 400,
    "message": "Bad Request"
}
```

**❌ Invalid Forward Target (HTTP 400):**
```json
{
    "detail": "failure: no such item",
    "error": 400,
    "message": "Bad Request"
}
```

### Postman Setup

1. Method: POST
2. URL: `http://192.168.88.1/rest/ip/dns/static/add`
3. Auth → Basic Auth
4. Headers:
   - Key: `Content-Type`
   - Value: `application/json`
5. Body → raw → JSON:
```json
{
    "name": "example.com",
    "forward-to": "MihomoProxyRoS",
    "comment": "_my"
}
```
6. Send

---

## 3. List All DNS Static Entries

### curl Example

```bash
curl -X GET \
  "${ROUTER_URL}/rest/ip/dns/static" \
  -u "${USERNAME}:${PASSWORD}"
```

### Expected Response

**✅ Success (HTTP 200):**
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
        "forward-to": "8.8.8.8",
        "comment": "_test",
        "disabled": "false"
    }
]
```

**Empty list:**
```json
[]
```

---

## 4. Get Specific DNS Entry by ID

### curl Example

```bash
# Get entry with ID *462
curl -X GET \
  "${ROUTER_URL}/rest/ip/dns/static/*462" \
  -u "${USERNAME}:${PASSWORD}"
```

### Expected Response

**✅ Success (HTTP 200):**
```json
{
    ".id": "*462",
    "name": "example.com",
    "forward-to": "MihomoProxyRoS",
    "comment": "_my",
    "disabled": "false"
}
```

**❌ Not Found (HTTP 404):**
```json
{
    "detail": "no such item",
    "error": 404,
    "message": "Not Found"
}
```

---

## 5. Delete DNS Entry

### curl Example

```bash
# Delete entry with ID *462
curl -X DELETE \
  "${ROUTER_URL}/rest/ip/dns/static/*462" \
  -u "${USERNAME}:${PASSWORD}"
```

### Expected Response

**✅ Success (HTTP 200):**
```json
{}
```

**❌ Not Found (HTTP 404):**
```json
{
    "detail": "no such item",
    "error": 404,
    "message": "Not Found"
}
```

---

## 6. Update/Modify DNS Entry

### curl Example

```bash
# Change forward-to for entry *462
curl -X PATCH \
  "${ROUTER_URL}/rest/ip/dns/static/*462" \
  -u "${USERNAME}:${PASSWORD}" \
  -H "Content-Type: application/json" \
  -d '{
    "forward-to": "8.8.8.8"
  }'
```

### Expected Response

**✅ Success (HTTP 200):**
```json
{
    ".id": "*462",
    "name": "example.com",
    "forward-to": "8.8.8.8",
    "comment": "_my",
    "disabled": "false"
}
```

---

## Complete Testing Script

Save this as `test_mikrotik_api.sh` and run with bash:

```bash
#!/bin/bash

# Configuration
ROUTER_URL="http://192.168.88.1"
USERNAME="dns-api"
PASSWORD="your-password"

echo "=== MikroTik REST API Testing ==="
echo ""

# Test 1: Authentication
echo "1. Testing authentication..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X GET "${ROUTER_URL}/rest/system/identity" \
  -u "${USERNAME}:${PASSWORD}")

http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_CODE")

if [ "$http_code" = "200" ]; then
    echo "✅ Authentication successful"
    echo "Router: $body"
else
    echo "❌ Authentication failed (HTTP $http_code)"
    echo "$body"
    exit 1
fi

echo ""

# Test 2: Add DNS entry
echo "2. Adding DNS entry for test.com..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST "${ROUTER_URL}/rest/ip/dns/static/add" \
  -u "${USERNAME}:${PASSWORD}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test.com",
    "forward-to": "8.8.8.8",
    "comment": "_test_script"
  }')

http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_CODE")

if [ "$http_code" = "200" ]; then
    echo "✅ DNS entry added successfully"
    echo "Response: $body"
    entry_id=$(echo "$body" | grep -o '"ret":"[^"]*"' | cut -d'"' -f4)
    echo "Entry ID: $entry_id"
elif echo "$body" | grep -q "already exists"; then
    echo "⚠️  Entry already exists"
else
    echo "❌ Failed to add entry (HTTP $http_code)"
    echo "$body"
fi

echo ""

# Test 3: List DNS entries
echo "3. Listing DNS entries..."
curl -s -X GET "${ROUTER_URL}/rest/ip/dns/static" \
  -u "${USERNAME}:${PASSWORD}" | python3 -m json.tool 2>/dev/null || \
  curl -s -X GET "${ROUTER_URL}/rest/ip/dns/static" -u "${USERNAME}:${PASSWORD}"

echo ""
echo "=== Testing Complete ==="
```

**Usage:**
```bash
chmod +x test_mikrotik_api.sh
./test_mikrotik_api.sh
```

---

## JavaScript Fetch Examples

For testing in browser console or Node.js:

```javascript
// Configuration
const ROUTER_URL = 'http://192.168.88.1';
const USERNAME = 'dns-api';
const PASSWORD = 'your-password';

// Helper function
async function mikrotikAPI(method, path, body = null) {
  const options = {
    method: method,
    headers: {
      'Authorization': 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`),
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${ROUTER_URL}${path}`, options);
  const data = await response.json();
  
  return {
    status: response.status,
    ok: response.ok,
    data: data
  };
}

// Test 1: Get identity
async function testAuth() {
  const result = await mikrotikAPI('GET', '/rest/system/identity');
  console.log('Auth test:', result);
}

// Test 2: Add DNS entry
async function addDNS(domain) {
  const result = await mikrotikAPI('POST', '/rest/ip/dns/static/add', {
    name: domain,
    'forward-to': '8.8.8.8',
    comment: '_test'
  });
  console.log('Add DNS:', result);
}

// Test 3: List DNS entries
async function listDNS() {
  const result = await mikrotikAPI('GET', '/rest/ip/dns/static');
  console.log('DNS entries:', result);
}

// Run tests
testAuth();
addDNS('test.com');
listDNS();
```

---

## Common Issues

### Issue: CORS Error in Browser
**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:** This happens when testing from browser console. The extension has proper permissions to avoid CORS. For manual testing:
- Use curl instead
- Or install a CORS browser extension temporarily

### Issue: Connection Refused
**Error:** `Failed to connect to 192.168.88.1`

**Solutions:**
- Check router IP is correct
- Ping the router: `ping 192.168.88.1`
- Verify REST API is enabled: `/ip service print`

### Issue: 401 Unauthorized
**Causes:**
- Wrong username or password
- User doesn't exist
- User disabled

**Debug:**
```routeros
# Check if user exists
/user print where name="dns-api"

# Check user is enabled
/user print detail where name="dns-api"

# Reset password
/user set dns-api password=new-password
```

### Issue: 403 Forbidden
**Cause:** User lacks permissions

**Solution:**
```routeros
# Check user group
/user print detail where name="dns-api"

# User needs at least 'write' group
/user set dns-api group=write
```

---

## Debugging Extension API Calls

### Chrome DevTools

1. Click extension icon
2. Right-click popup → "Inspect"
3. Go to Network tab
4. Click "Add to MikroTik"
5. See API call details:
   - Request URL
   - Request Headers (check Authorization)
   - Request Payload
   - Response status
   - Response body

### Console Logging

The extension code includes console.log statements:

```javascript
// In options.js
console.log('Response status:', response.status);
console.log('Response ok:', response.ok);
console.log('Response data:', data);
```

Check browser console for these logs when testing.

---

## Rate Limiting

MikroTik REST API may have rate limits. If you see errors during rapid testing:

**Wait a few seconds between requests** or check router logs:
```routeros
/log print where message~"REST"
```

---

## API Response Summary

| Endpoint | Method | Success Code | Success Body |
|----------|--------|--------------|--------------|
| `/rest/system/identity` | GET | 200 | `{"name": "RouterName"}` |
| `/rest/ip/dns/static/add` | POST | 200 | `{"ret": "*ID"}` |
| `/rest/ip/dns/static` | GET | 200 | `[{...}, {...}]` |
| `/rest/ip/dns/static/*ID` | GET | 200 | `{...}` |
| `/rest/ip/dns/static/*ID` | DELETE | 200 | `{}` |
| `/rest/ip/dns/static/*ID` | PATCH | 200 | `{...}` |

| Error Code | Meaning | Common Causes |
|------------|---------|---------------|
| 400 | Bad Request | Invalid parameters, entry exists |
| 401 | Unauthorized | Wrong username/password |
| 403 | Forbidden | User lacks permissions |
| 404 | Not Found | Entry doesn't exist |
| 500 | Internal Error | RouterOS error |
