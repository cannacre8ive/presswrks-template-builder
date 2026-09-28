# Public beta release — 2026-09-28

Production: https://presswrks-template-builder.vercel.app/  
Repository: https://github.com/cannacre8ive/presswrks-template-builder

## Verified during packaging
- 24 automated geometry and sharing checks pass; dependency-free build succeeds.
- Five presets render valid geometry and enable export.
- Custom 1.25-inch lid has linked height; real downloaded JSX payload has width/height 1.25. All-five download contains five configurations. Both downloaded files pass JavaScript syntax parsing after the Illustrator directive is removed.
- Empty width blocks export with an announced error; valid input recovers. Other-flat-label selection yields a rectangle. 3-inch circumference plus 0.1 overlap derives 3.1-inch width.
- Shared link reopens 1.25-inch dimensions; reset and local recall preserve starting geometry.
- Public stable production URL rendered without a login in the browser.
- Desktop and 320px mobile visually checked; mobile document width equals viewport width. Mobile header uses a second navigation row to prevent the logo crowding links.
- Real production screenshots stored in documentation/assets. Social preview is a PNG at 1200 × 630.
- Original HTML checksum preserved; no existing project/source was overwritten.

## Limits
No claim of verified Illustrator runtime, native dialog behavior, `.ait` reopening, PDF separations or physical fit. Those require the actual Illustrator and production workflow. Clipboard fallback is implemented; the tested browser used successful copying. This is manual accessibility checking, not a formal WCAG certification. Social-platform cache/preview scrapers are not tested.

## Final release verification
- Unauthenticated HTTP 200 for the stable homepage, social PNG, offline HTML, native JSX and favicon.
- PNG signature and exact 1200 × 630 dimensions verified. Canonical URL, full Open Graph/Twitter metadata and indexability verified on served HTML.
- Production 2-inch share link reopened correct geometry; downloaded script is available locally. Malformed link safely recovered to a preset; no console errors observed.
- GitHub repository is public, Issues enabled, homepage points to the stable production URL. GitHub check workflow passed for release commit 5472278.
- Vercel project is isolated, GitHub-connected, Node 24, output dist. Production deployment dpl_BY6jSeL1zmKEiMtG6zzrSnLQ4aFP verified.
- Feedback link reaches GitHub sign-in with the correct issue-chooser return URL. No report submitted; signed-in issue-form submission is not tested.
- Home library now opens the live tool and provides repository/offline links. A local OPEN-PRESSWRKS.webloc shortcut is also supplied outside this repository.


## Branding correction — 2026-09-28

Displayed brand corrected to PRESSWRK. with the red period retained. Existing repository/deployment URLs and download filenames stay compatible. Browser title, wordmark and accessibility name verified live. The existing 24 checks pass; production screenshots refreshed. This correction is grouped in one Git commit, pushed to main for automatic deployment.
