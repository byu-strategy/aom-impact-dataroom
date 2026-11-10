# Data Room Website

A static, no-build website for browsing this data room: the engagement brief, the document library, the interview notes, and live charts computed from `data/*.csv`.

The site reads the repo's own markdown and CSV files at runtime, so there is nothing to regenerate: edit a document or re-run the data pull and the site picks it up.

## Run locally

Browsers block `fetch()` from `file://`, so serve the **repo root** (not `site/`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/site/
```

## Publish on GitHub Pages

Settings → Pages → Deploy from branch → `main`, folder `/ (root)`. The site will be at `https://<org>.github.io/<repo>/site/`.

## Files

| File | Role |
|---|---|
| `index.html` | Shell: header, nav, script tags |
| `styles.css` | Light/dark theme tokens and layout |
| `app.js` | Hash router, document catalog, markdown rendering, data page |
| `charts.js` | Small hand-built SVG bar and line charts with hover tooltips |

To add a document to the Library, add an entry to `CATALOG` in `app.js`.
