# PLAYBOX

File-based digital catalog. Drop a `.html` metadata file into `database/games/` or `database/applications/` and it appears on the site automatically. No admin panel, no accounts.

## Install on Windows 10/11
1. Install Node.js LTS (18+) from https://nodejs.org (accept defaults).
2. Unzip this folder, e.g. to `C:\playbox`.
3. Open PowerShell or Command Prompt in that folder (Shift + right-click > "Open in Terminal").
4. Run:

       npm install
       npm start

5. Open http://localhost:3000

To use another port in PowerShell: `$env:PORT=8080; npm start`.
For auto-restart while editing code: `npm run dev`.

## Adding a product
Create `database/games/MyGame.html` (file name = product id; letters, digits, `.`, `_`, `-` only):

    App=MyGame
    Version=1.0
    Languages=Ukrainian,English
    Status=Release
    Cost=Free
    DownloadLink=https://drive.google.com/...
    Icon4x4Link=https://i.ibb.co/...
    Icon4x6Link=https://i.ibb.co/...

- Required: App, Version, Languages, Status, Cost, Icon4x4Link. DownloadLink is required for Free products.
- Status: Release | Beta | InDevelopment. Cost: Free | Paid.
- Icon4x6Link is optional (falls back to Icon4x4Link). Lines starting with `#` are comments.
- Files are parsed as plain text only; nothing in them is ever executed or rendered as HTML.
- Errors are printed in the server console, e.g. `ERROR games/MyGame.html: Missing required field "App"`; invalid files are skipped.

New/edited/deleted files are detected through filesystem watching plus a 15 s rescan fallback. Open pages refresh themselves within about 5 s.

## API
- `GET /api/products?category=games|applications&q=text`
- `GET /api/products/:category/:id`
- `GET /api/download/:category/:id` (Free: redirect to external link; Paid: 402)
- `GET /api/version` (catalog revision), `GET /api/health`

Paid download links are never returned by the API.

## Structure
    server.js              Express app, security headers, static files
    src/parser.js          Safe key=value parser + validation
    src/productStore.js    Scanner, watcher, cache
    src/api.js             API routes (download gateway = future payment hook)
    public/                Frontend (index.html, css/, js/: app, api, i18n, store)
    database/games|applications/   Your product files (never served directly)
