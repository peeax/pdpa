# พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๒ (Thailand PDPA)

เว็บไซต์ พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล แบบ interactive ด้วยระบบ stacked pages และ wiki-links

พัฒนาโดย **Siriraj Informatics and Data Innovation Center (SiData+)** คณะแพทยศาสตร์ศิริราชพยาบาล

## Run

```bash
npm install        # ครั้งแรกเท่านั้น
npm run dev        # http://localhost:3000
```

## Other Scripts

```bash
npm run gen        # regenerate public/notes/*.json from content/
npm run build      # static export to ./out
npm start          # serve the production build
```

> `predev` / `prebuild` จะรัน `scripts/gen-public.mjs` อัตโนมัติ
> ถ้าแก้ไฟล์ใน `content/` ขณะ dev server ทำงาน ให้รัน `npm run gen` แล้ว refresh

## Project Structure

```
pdpa/
├── app/            # Next.js App Router pages
├── components/     # React components (BrainNote, Footer, etc.)
├── content/        # Markdown notes + highlights-data.json
├── lib/            # Data layer (build-notes, stacked pages, etc.)
├── public/         # Static assets (pdfs/, favicon)
├── scripts/        # Build & utility scripts
└── theme/          # Theme-UI theme configuration
```

## License

MIT
