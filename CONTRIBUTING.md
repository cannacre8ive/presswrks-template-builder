# Contributing

Use Node 24, run `npm ci` then `npm run check`; `npm run dev` serves only on localhost. Use `feature/description` or `fix/description` branches and a focused pull request with behavior, evidence and limitations.

No formatter or linter dependency is required. Keep readable vanilla JS and do not add runtime dependencies for routine UI changes. `src/engine.js` must remain ES3-compatible for ExtendScript; never manually edit generated `dist/` or duplicate its engine string. Add regressions for changes to geometry, imported data or script output. Follow TESTING.md before push/deploy.

Public issues must not include confidential customer art, credentials or identifying business records. Bug/idea templates request reproducible dimensions, browser and Illustrator version where applicable. Do not claim production approval without Illustrator and fit evidence.
