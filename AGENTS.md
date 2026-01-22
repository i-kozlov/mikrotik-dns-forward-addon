# Repository Guidelines

## Project Structure & Module Organization
- `manifest.json` and `manifest.firefox.json` define Chrome (MV3) and Firefox (MV2) entry points and permissions.
- Core logic lives in `background.js` (API calls), `utils.js` (shared helpers), and `i18n.js` (translations).
- UI is split into `popup/` (toolbar UI) and `options/` (settings page), each with HTML/CSS/JS files.
- Localization strings live in `_locales/`; assets are in `icons/`.
- `dist/` is build output and should be treated as generated artifacts.

## Build, Test, and Development Commands
- `./build.sh` packages the extension into `dist/` and produces Chrome/Firefox archives.
- Manual dev load:
  - Chrome: `chrome://extensions/` → Load unpacked → repo root.
  - Firefox: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `manifest.firefox.json`.

## Coding Style & Naming Conventions
- Use 2-space indentation in JS/HTML/CSS and keep semicolons in JS.
- Favor `camelCase` for JS functions/variables and lower-case file names (e.g., `popup.js`).
- Keep UI strings in `_locales/` and access them via `browser.i18n`/`chrome.i18n`.

## Testing Guidelines
- No automated test suite is currently configured.
- Verify changes manually by loading the extension and exercising:
  - “Test Connection” on the Options page.
  - “Add to MikroTik” from the popup on a real domain.

## Commit & Pull Request Guidelines
- Commit messages are short, imperative, and sentence case (e.g., “Add privacy policy”).
- Use scoped prefixes when needed (e.g., `Release v1.3.0: ...`, `WIP: ...`).
- PRs should include a concise summary, manual testing notes, and screenshots for UI changes.

## Security & Configuration Tips
- Do not commit router credentials or personal endpoints; configs are stored in `chrome.storage.local`.
- If you add new config fields, update both `options/` UI and `background.js` request payloads.
