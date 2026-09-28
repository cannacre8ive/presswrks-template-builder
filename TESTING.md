# Testing and release evidence

## Automated
`npm run check`: 24 Node checks for presets, circular dimensions, invalid geometry, short wraps, strict URL parsing and round trips; then deterministic hosted/offline build. These do not emulate Illustrator or certify physical output.

## Before each release
- [ ] Test all five presets, custom lid 1.25 and 2 inches, other flat label, wrap width calculation.
- [ ] Clear/negative/too-small dimensions show errors; export blocked then recovers.
- [ ] Download one customized script and all five; inspect actual payload and syntax.
- [ ] Share and reopen a custom setup; malformed setup shows safe default.
- [ ] Reset and last-valid local recall; clipboard fallback and keyboard focus.
- [ ] Responsive visual check at desktop and 320px; labeled controls and no horizontal overflow.
- [ ] Public stable alias and social PNG return 200 without authentication; metadata matches alias.
- [ ] Feedback link opens the intended repository chooser, without submitting an issue.
- [ ] Save current screenshots, update README/CHANGELOG and verify GitHub CI.

## Separate production acceptance
Run generated JSX in Adobe Illustrator; inspect CMYK, 300 ppi, ten layers, spot names, stroke overprint, guides, bleed setting, saved `.ait` reopening, PDF separations and applied fit. This acceptance is pending and must not be inferred from browser tests.

Final observations are recorded in documentation/RELEASE.md.
