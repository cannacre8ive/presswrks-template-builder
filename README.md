![PRESSWRKS. template builder](documentation/assets/desktop.png)

# PRESSWRKS. — Packaging Template Builder

## 🚀 Live Demo

**[Open the template builder](https://presswrks-template-builder.vercel.app/)** · [Send feedback](https://github.com/cannacre8ive/presswrks-template-builder/issues/new/choose)

Five packaging presets and custom dimensions, with a schematic preview of cut, bleed, safe area and overlap. Download an editable Illustrator script or share the exact setup with someone reviewing your work. No account is needed to use the builder.

## Use it

1. Choose a preset or Custom template. Enter decimal inches; lid diameter controls both dimensions.
2. Inspect the preview and resolve any geometry errors. Confirm actual container measurements separately.
3. Download Illustrator script. In Adobe Illustrator choose **File → Scripts → Other Script…**, run the `.jsx`, and choose an output folder.
4. Add your artwork to the generated `.ait`, inspect separations and test fit before production.

**Share this setup** copies a link containing the template name and dimensions. Use a non-confidential name. Your last valid setup stays in your browser when storage is available. GitHub feedback requires a GitHub account and is public.

Adobe Illustrator is required to create `.ait` documents. This public beta has browser and geometry verification; Illustrator execution, saved templates, separation output and physical fit still need verification in your environment. The app is not a compliance checker.

[Offline HTML builder](https://presswrks-template-builder.vercel.app/PRESSWRKS-Template-Builder.html) · [Illustrator-native dialog](https://presswrks-template-builder.vercel.app/PRESSWRKS-Template-Builder.jsx)

## Quick setup

Node 24 and Python 3 for the optional local server. There are no npm dependencies, API keys or accounts to configure.

```sh
npm ci
npm run check
npm run dev
```

Open http://127.0.0.1:8872. `npm run build` generates `dist/index.html` and a self-contained offline HTML from the same source. Vercel publishes only `dist/`.

## Architecture

Plain HTML, CSS and JavaScript. `src/engine.js` owns the geometry and ES3-compatible Illustrator generator; `src/app.js` owns the form; `src/sharing.js` validates URL configurations. A small Node build embeds one engine into the web runtime and downloaded scripts, avoiding duplicate-source drift. No database, telemetry, external fonts or runtime API calls. See [ARCHITECTURE.md](ARCHITECTURE.md).

## Presets

| Preset | Starting trim |
|---|---|
| Pre-roll tube wrap | 2.410 × 1.500 in |
| Concentrate jar lid | 1.000 in diameter |
| Concentrate jar sidewall | 3.560 × 0.550 in |
| Deli-style flower lid | 2.750 in diameter, provisional placeholder |
| Eighth pre-pack wrap | 7.220 × 1.500 in |

All are editable. Generated documents target CMYK, 300 ppi, ten named layers, CutContour and four additional spot swatches. White and gloss artwork must be supplied; unused swatches do not make plates. Tapered / arc dielines are outside this version.

## Recent updates

- 2026-09-28: Public beta release, stronger PRESSWRKS. wordmark with red period, setup-sharing links, local recall, reset, keyboard focus and feedback entry.
- Single-source generator, 24 automated geometry/sharing checks, repository documentation and real UI social preview.

See [CHANGELOG.md](CHANGELOG.md), [TESTING.md](TESTING.md), and [ROADMAP.md](ROADMAP.md). The original browser builder is preserved with a checksum under `source/`. Original source notes are provenance, not release instructions.

## Sharing

Suggested description: “PRESSWRKS. turns packaging dimensions into editable Illustrator templates. Try a preset or your own size, preview the geometry, and send feedback.”

Production: https://presswrks-template-builder.vercel.app/  
Repository: https://github.com/cannacre8ive/presswrks-template-builder
