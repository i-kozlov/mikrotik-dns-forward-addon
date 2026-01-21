# Changelog - Version 1.2

## Latest Fixes (v1.2):

### 🔧 Fixed Test Connection
- **Fixed authentication check** - now properly detects wrong password (HTTP 401 error)
- **Fixed identity display** - correctly parses `{"name": "RouterName"}` response
- **Better error messages**:
  - HTTP 401 → "Invalid username or password"
  - HTTP 403 → "User lacks required permissions"
  - Network error → "Cannot connect to router. Check URL and ensure REST API is enabled"
- No more false positives with wrong credentials

### 🎯 Default Router URL
- Changed default from `https://192.168.99.250` to `http://192.168.88.1`
- Matches standard MikroTik default IP
- Updated all documentation examples

## Previous Updates (v1.1):

### 1. ✅ Official MikroTik Logo Icons
- Replaced placeholder icons with official MikroTik logo
- Added icon16.png, icon48.png, icon128.png from your uploaded logo
- Extension now displays proper branding

### 2. ✅ URL Protocol Validation
- Added strict validation that URL must start with `http://` or `https://`
- Clear error message if protocol is missing
- Prevents invalid configuration

### 3. ✅ Default Value for Forward To
- `MihomoProxyRoS` is now both placeholder AND default value
- Pre-filled when opening settings for first time
- Can still be changed to any other value

### 4. ✅ Editable Domain Input
- Domain field in popup is now an editable text input
- Auto-fills with extracted base domain
- User can modify before adding to MikroTik
- Useful for adding custom domains or fixing extraction issues

### 5. ✅ Security Info for dns-api User
- Added prominent info box in settings about creating dedicated user
- Includes copy-paste ready command:
  ```
  /user add name=dns-api password=long-random-password group=write
  ```
- Explains why using separate user is recommended
- Updated README with detailed security section

## Security Recommendations:

**Does it work for dns-api user?**
Yes! The `dns-api` user created with `group=write` has permission to:
- Add DNS static entries
- Modify DNS configuration
- Read system information (for connection test)

This is exactly what the extension needs, without granting full admin access.

**Best Practice:**
```routeros
# Create dedicated API user
/user add name=dns-api password=STRONG-RANDOM-PASSWORD-HERE group=write \
  address=192.168.99.0/24 comment="Browser extension DNS API"

# Verify it works
/user print detail where name=dns-api
```

Then in extension settings use:
- Username: `dns-api`
- Password: `STRONG-RANDOM-PASSWORD-HERE`

## Testing Checklist:

- [ ] Install/reload extension in Chrome
- [ ] Open settings, verify URL validation (try without http://)
- [ ] See info box about dns-api user
- [ ] Notice Forward To field has default value
- [ ] Create dns-api user on MikroTik
- [ ] Test connection with dns-api credentials
- [ ] Open popup on any website
- [ ] Verify domain is editable
- [ ] Try editing domain before adding
- [ ] Confirm DNS entry appears in MikroTik
