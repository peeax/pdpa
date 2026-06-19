# PDPA — Next.js migration

A 1:1 visual port of the original Gatsby site (`gatsby-theme-andy`) to **Next.js
(App Router)**, built to start much faster in development while rendering
identically.

It lives in this subfolder so the original Gatsby site at the repo root stays
intact for side-by-side comparison. Content is **shared** — this app reads the
same `../content` Markdown files and `../content/highlights-data.json`.

## Run

```bash
cd next-app
npm install        # first time only
npm run dev        # http://localhost:3000  (regenerates note data first)
```

Other scripts:

```bash
npm run gen        # regenerate public/notes/*.json from ../content
npm run build      # static export to ./out  (like `gatsby build`)
npm start          # serve the production build
```

> `predev`/`prebuild` run `scripts/gen-public.mjs` automatically, so the note
> data and copied static assets are always fresh. If you edit `../content`
> while `dev` is running, re-run `npm run gen` to pick it up.

## How the original maps to this app

| Original (Gatsby) | Here (Next.js) |
| --- | --- |
| `@aengusm/gatsby-theme-brain` data layer (slugs, `[[wiki-links]]`, back-links) | `lib/build-notes.mjs` (+ `generate-slug.mjs`, `insert-links.mjs`, `excerpt.mjs`) — ported logic |
| `react-stacked-pages-hook` (uses `window.___loader`, gatsby `navigate`) | `lib/stacked.js` — same scroll/obstruction physics; fetches `/notes/<slug>.json`, navigates via the History API |
| `BrainNoteContainer`, `BrainNote`, `Footer`, `ReferredBlock`, `Popover`, `Header`, `MdxComponents` | `components/*` — ported to theme-ui `Themed` + `sx` |
| `gatsby-plugin-mdx` body rendering | `components/MarkdownContent.jsx` (`react-markdown`, elements mapped to `Themed.*`) |
| shadowed `themes.js` | `theme/index.js` |
| `gatsby-plugin-manifest` | `app/layout.jsx` metadata + generated `public/manifest.webmanifest` |
| pages at `/`, `/<slug>` (root note = `about`) | `app/page.jsx` (root) + `app/[slug]/page.jsx` |

## Notes on parity

- **Stacked pages**: desktop (≥768px) stacks notes in sticky columns via
  `?stackedPages=...`; below 768px a click is a full navigation to that note —
  matching the original's mobile behaviour.
- **Static output**: `npm run build` produces a fully static `out/` (Next
  `output: 'export'`), the closest equivalent to Gatsby's static build. Dev mode
  omits export so dynamic routes render on demand.
- **Highlight notes** (`content/highlights-data.json`) render the same way as in
  the original `BrainNote` (PDF embed / pre-wrap plain-text content).
