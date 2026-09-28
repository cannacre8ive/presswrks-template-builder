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

## v1.2 artwork and intake checks

41 Node tests cover geometry/sharing, RGB and CMYK headers, misleading DPI metadata, print-size scaling, proportions, truncation, PDF placement transforms, intake validation, file/hash binding, production holds and a mocked Drive adapter (private context, retry idempotency, signature rejection, daily cap, spreadsheet formula escaping). Mocks do not prove a live Google integration.

Browser checks: native CMYK JPEG upload, generated RGB PNG, vector PDF with trim/bleed boxes, low-resolution PDF (45 PPI), preview rendering, changed-dimension invalidation, project details and brief download control. Online submission is disabled until Google authorization/configuration is complete. Live integration acceptance requires a synthetic submission, folder/checksum verification and duplicate retry after activation.

The generated project-brief JSON was also read back from the browser download and its quantity, artwork outcome, estimating area and production hold verified. Responsive CSS is included, but the browser viewport override did not apply during this run; a new 320 px visual QA is not claimed.
