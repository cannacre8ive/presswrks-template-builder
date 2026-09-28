# Architecture

Dependency-free static application, Node 24 build, Vercel static hosting. No application endpoints, secrets, database or server functions.

```
src/engine.js      geometry validation and ES3 Illustrator engine
src/sharing.js     strict versioned URL setup parser
src/app.js         browser form, preview, download, sharing and recall
src/styles.css    responsive styles
src/page.html     semantic page shell and social metadata
scripts/build.mjs one-source hosted/offline build
public/           favicon, native Illustrator script, social preview
source/           immutable original browser artifact and checksum
tests/            Node geometry and sharing regressions
documentation/    release evidence and screenshots
dist/             generated deploy output (ignored)
```

Configuration: name, product index, shape, width/height/bleed/safe/overlap/circumference/radius in inches, stock preview, symbol reference flag and measured flag. Shared URL uses a version-1 JSON fragment; fragment contents are not sent to the hosting server. Local storage key `presswrks-template-builder-v1` contains the last valid configuration.

Downloaded JSX embeds the same engine used for validation. Native dialog download is the separately preserved existing ScriptUI artifact; Illustrator runtime remains unverified.

Vercel runs `npm ci --ignore-scripts` then `npm run build`, publishes `dist`. Security headers deny framing, remote requests, objects and form submissions. Inline scripts/styles are intentional for the downloadable single HTML. GitHub CI runs `npm ci` and `npm run check`.
