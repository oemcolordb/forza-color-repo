Place the generated image assets in this `public/` folder with the exact filenames below so the app metadata and icons work correctly:

- `icon.png` — main app icon (512x512)
- `og-image.png` — social preview / Open Graph (1200x630)
- `hero-bg.png` — hero background image (1920x1080)
- `favicon.png` — favicon (64x64)

Implementation Tip:
- Use `text-[#FF2D55]` (Forza Pink) for hero headings or primary CTA buttons over `hero-bg.png`.
- For card backgrounds use a semi-transparent dark gray, e.g. `bg-[#1A1A1A]/80`, with `backdrop-blur-md`.

If you already generated these files locally, copy them into `public/` and they will be served automatically by Next.js.
