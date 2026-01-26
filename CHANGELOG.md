# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2026-01-26

### Added
- Match subdomain checkbox in popup (enabled by default)
- Copy button (📋) for user creation script with visual feedback
- Clipboard API integration for one-click copy

### Changed
- Updated user creation commands to use `api` group with proper policies
- Combined script commands into single unified code block
- Improved code block styling and positioning

### Localization
- Added "Match subdomains" / "Включая поддомены" translations

## [1.4.1] - 2026-01-26

### Fixed
- Corrected default router URL from `http://router.lan/` to `http://router.lan` (removed trailing slash)

## [1.4.0] - 2026-01-23

### Added
- Optional address-list field in DNS configuration
- Automatic DNS cache flush toggle in settings
- Separate status messages for main action and cache flush result
- Toggle switch UI for DNS cache flush option
- Detailed error handling for DNS flush operations

### Changed
- Default router URL changed to `http://router.lan/`
- Removed technical placeholders from i18n (moved to HTML attributes)
- Updated README links to point to Chrome Web Store, Firefox Add-ons, and MihomoProxyRoS documentation

### Localization
- Added address-list field translations
- Added DNS cache flush messages (success/failure)

## [1.3.1] - 2026-01-22

### Changed
- Added data_collection_permissions with 'none' value for Firefox
- Address-list support improvements

## [1.2.0]

### Fixed
- Fixed test connection authentication check

### Added
- Added cache bypass for API requests
- Added build timestamp to settings page

### Technical
- Chrome: Manifest V3
- Firefox: Manifest V2 (MV3 has auth header bug)

## [1.1.0]

### Added
- Official MikroTik logo icons
- URL protocol validation (http/https required)
- Editable domain input in popup
- Default value for Forward To field

## [1.0.0]

### Added
- Initial release
- One-click DNS forward from browser
- Chrome and Firefox support
- MikroTik REST API integration
- Configuration page for router credentials
- Multi-language support (English, Russian)
