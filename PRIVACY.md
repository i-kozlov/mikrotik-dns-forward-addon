# Privacy Policy

**MikroTik DNS Forward** browser extension.

## Data Collection

This extension does **NOT** collect, transmit, or share any personal data with external servers.

## Data Storage

The extension stores the following data **locally** in your browser:

- MikroTik router URL
- MikroTik username and password
- DNS forward configuration (forward-to target, comment)

This data is stored using the browser's built-in storage API (`chrome.storage.local`) and never leaves your device.

## Network Requests

The extension only makes network requests to:

- **Your MikroTik router** — to add DNS forward rules and test connection

No data is sent to any third-party servers or analytics services.

## Permissions

- **activeTab** — to get the current website's URL for domain extraction
- **storage** — to save your router configuration locally
- **notifications** — to show confirmation when a rule is added
- **host_permissions** — to communicate with your MikroTik router's REST API

## Open Source

This extension is open source. You can review the code at:
https://github.com/i-kozlov/mikrotik-dns-forward-addon

## Contact

For questions or concerns, please open an issue on GitHub.

---

Last updated: January 2026
