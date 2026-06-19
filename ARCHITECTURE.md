# PDPA Site Architecture

Welcome to the PDPA website source code! This document provides a high-level overview of how the website is built and structured, making it easy for beginners and new contributors to understand.

## Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (Using the App Router `app/`)
- **UI & Styling**: [Theme UI](https://theme-ui.com/) and standard CSS (`public/index.css`)
- **Content**: Markdown (`.md`)
- **Hosting**: Fully Static HTML/CSS/JS (configured via `output: 'export'` in `next.config.mjs`)

## Directory Structure
- `app/`: Contains the main Next.js layout and entry point pages.
- `components/`: Contains all reusable React components (e.g., `Header`, `SearchModal`, `MarkdownContent`).
- `content/`: Contains the actual Markdown files that make up the content of the website. To add or edit text, you usually just edit the files here.
- `lib/`: Contains utility functions, data-fetching logic, and context providers (e.g., stacked pages logic, slug generation).
- `public/`: Contains static assets like images, global CSS (`index.css`), and the generated `search-index.json`.
- `scripts/`: Contains Node.js scripts (like `gen-public.mjs`) that run during the build process to generate the search index.
- `theme/`: Contains the Theme UI configuration tokens (colors, fonts, base styles).

## Key Concepts
### 1. Stacked Pages (Andy Matuschak mode)
The website uses a horizontally-stacked page layout. When you click a link, instead of replacing the current page, a new page is pushed onto the right side of the screen. This is managed by `lib/stacked.js` and `components/BrainNoteContainer.jsx`.

### 2. Static Generation (SSG)
Because the data is based purely on Markdown files, the website is built statically.
When you run `npm run build`, Next.js compiles all React components and Markdown files into pure HTML files. This ensures the website is incredibly fast, secure against server-side attacks, and can handle millions of users concurrently without crashing.

### 3. Markdown Rendering
Markdown is parsed and transformed into React components using `react-markdown`.
- To style Markdown elements, we map HTML tags to Theme UI components inside `components/MarkdownContent.jsx`.
- **Security**: We use `rehype-sanitize` to strip out dangerous code and prevent Cross-Site Scripting (XSS) attacks.

## How to Start Developing
1. Run `npm install` to install dependencies.
2. Run `npm run dev` to start the local server.
3. Edit files in `content/` to change text, or `components/` to change layout.
4. If you change Markdown files, the `nodemon` watcher (configured in `package.json`) will automatically rebuild the `search-index.json`.
