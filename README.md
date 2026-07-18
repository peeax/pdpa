# Thai PDPA Website (Unofficial)

The content on this website is based on [the official document of Thailand's Personal Data Protection Act (PDPA) B.E. 2562](http://www.ratchakitcha.soc.go.th/DATA/PDF/2562/A/069/T_0052.PDF).

The website represents PDPA in a new format using interactive stacked pages and wiki-links, built with [Next.js](https://nextjs.org) (licensed under MIT).

The goal is to provide ease of access to PDPA and allow tracking of article references. Users can open referenced articles on the side portion of the desktop screen or landscape tablet (not on mobile or narrow screen).

## How-to

### Requirements

- Node.js 22.16.0 (pinned in `.node-version`; minimum supported version is 20.9.0)
- npm

### Install

Clone this repository to your machine. At the repository's root directory, run

```bash
npm ci
```

### Development

Run

```bash
npm run dev
```

Then go to `http://localhost:3000` in your browser of choice. Any changes to the files saved will be automatically updated on the website.

### Build

Run

```bash
npm run check:production
```

This checks the source, verifies all 96 articles, builds the site, and validates
the generated routes, links, JSON, metadata, and security configuration. The
generated static site will be available at `./out`.

To preview that production build locally, run

```bash
npm start
```

Then open `http://localhost:3000`. You can choose another port with
`npm start -- --port 3400`.

### Deployment

Cloudflare Pages should use `npm run check:production` as the build command and
`out` as the build output directory. The repository pins the Cloudflare build
runtime through `.node-version` and supplies static-host security headers in
`public/_headers`.

Once code is pushed or merged into the deployment branch on GitHub, Cloudflare
Pages will automatically build and deploy the site. If unsure, open a Pull
Request first instead of pushing directly to the deployment branch.

## Contributions

Contributions are highly welcome. Please submit your PRs.

## License

MIT
