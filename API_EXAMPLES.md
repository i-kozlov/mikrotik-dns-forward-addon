# MikroTik REST API - Extension Endpoints

## Endpoints Used

### 1. Test Connection
```bash
curl -X GET "http://192.168.88.1/rest/system/identity" \
  -u "username:password"
```

**Success (200):**
```json
{"name": "RouterName"}
```

**Auth failed (401):**
```json
{"error": 401, "message": "Unauthorized"}
```

### 2. Add DNS Forward
```bash
curl -X POST "http://192.168.88.1/rest/ip/dns/static/add" \
  -u "username:password" \
  -H "Content-Type: application/json" \
  -d '{"name": "example.com", "forward-to": "TargetDNS", "comment": "_my"}'
```

**Success (200):**
```json
{"ret": "*462"}
```

**Already exists (400):**
```json
{"detail": "failure: entry already exists", "error": 400, "message": "Bad Request"}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 401 | Wrong credentials |
| 403 | User lacks permissions |
| 400 | Invalid params / entry exists |
