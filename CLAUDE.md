# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

weblist is a zero-dependency static website — a personal link directory / browser homepage. It renders categorized cards of links from a JSON config file. No build tools, no npm, no framework.

## Serving

This is a static site. Serve the root directory with any HTTP server:

```bash
python3 -m http.server 8080        # Python
npx serve .                        # Node (if available)
```

Open `index.html` directly from the filesystem **will not work** — the JS fetches `config/links.json`, which requires HTTP due to CORS restrictions on `file://` URLs.

## Architecture

```
index.html              # Entry point — page shell, <template> elements, Google search form
assets/
  app.js                # Vanilla JS module: fetches config/links.json, clones templates, renders DOM
  styles.css            # THE single stylesheet — all CSS lives here, no separate files
  background.jpg        # Tracked background; replaced temporarily during GitHub Pages builds
  icons/                # SVG icons for each link (referenced by links.json)
config/
  links.json            # THE data file — all link groups and items live here
```

### Data flow

1. `app.js` loads → `fetch('./config/links.json')` → parses JSON
2. Iterates `data.groups`, cloning `#group-template` per group
3. Iterates `group.items`, cloning `#card-template` per link item
4. Each card gets `url`, `title`, `description`, and icon with a recursive fallback chain (primary icon → `tagfile.ico` → null if all fail)

To add or remove links, edit only `config/links.json`. To change the page title, edit `"title"` in that file.

Groups and items are both dynamic — add/remove groups or items in `links.json` and the page renders accordingly without any code changes. The card grid is fixed at 4 columns (`repeat(4, minmax(0, 1fr))`) and auto-wraps to new rows when there are more than 4 items per group.

### Adding a link — full workflow

1. **Edit** `config/links.json` — add an item to the appropriate group (or add a new group first):
   ```json
   { "title": "Service Name", "description": "Short description", "url": "https://...", "icon": "./assets/icons/servicename.svg" }
   ```
2. **Fetch the icon** — use Google's favicon/w icon service to get an SVG icon. Save it as `assets/icons/<servicename>.svg`.
3. **Icon conventions** (all existing icons follow these rules — new icons must match):
   - SVG format, `width="1em" height="1em" viewBox="0 0 24 24"` — the 24×24 grid with em-based sizing ensures icons scale with text
   - `fill="currentColor"` — inherit color from the page's CSS `color` property, so the icon automatically follows the light/dark theme
   - Monochrome, path-only — no embedded `<style>`, no hardcoded colors, no raster `<image>` elements
   - Filename: lowercase, matches the service/domain name (e.g. `github.svg`, `notion.svg`)

### Theming

CSS custom properties on `:root` define light mode; `@media (prefers-color-scheme: dark)` overrides them. All colors reference `var(--text)`, `var(--panel)`, etc. — never hardcode colors in new CSS.

### Responsive breakpoints

- Default: 4-column card grid
- ≤900px: 2 columns
- ≤560px: 1 column, stacked search form

## Constraints

- **Single-file principle**: one HTML (`index.html`), one CSS (`assets/styles.css`), one JS (`assets/app.js`). Never create additional stylesheets, script files, or HTML pages — all new styles/logic go into the existing file.
- **No dependencies**: keep it zero-dependency — no npm, no CDN libraries, no frameworks.
