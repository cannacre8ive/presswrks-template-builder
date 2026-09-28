# User flow and states

1. Open public URL → default pre-roll preset; valid previous local setup restores if available.
2. A `#setup=` link takes precedence, after schema and geometry validation. Bad links show a message and safe default; imported content is never executed.
3. Choose preset/custom product → edit dimensions → synchronous geometry validation and schematic preview.
4. Circle → height follows diameter and is disabled. Wrap → circumference, overlap and width calculation appear.
5. Invalid input → readable error, no preview, export disabled. Correct input → preview and export recover.
6. Download → local `.jsx` → Illustrator File/Scripts/Other Script → choose folder → generated `.ait`. Cancel leaves no generated files; existing filenames get numeric suffixes.
7. Share → current valid setup URL copied; visible readonly fallback supports manual copying. The link includes name and dimensions and is public to anyone receiving it.
8. Reset → product starting dimensions, shared hash removed. Local changes save only valid setups when browser storage permits.
9. Feedback → public GitHub issue chooser; user signs in and submits their own report. No automatic message is sent.

No login/onboarding needed for core use. Offline HTML supports the builder and creates hosted share links. Browser storage is convenience, not a backup or team database.
