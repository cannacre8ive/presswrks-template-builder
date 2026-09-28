# Private Drive intake connection

Status: implemented and locally tested; not connected to a Google deployment. Do not enable the Vercel environment variables until the Google endpoint and a synthetic end-to-end submission are verified. Existing Drive and Sheets connector permissions do not give the public website permission to save files.

## One-time setup

1. In the Google account that owns the PRESSWRK home, create a standalone Apps Script project named `PRESSWRK Website Intake`. Paste `Code.gs` into its script file.
2. Add Script Properties in Project Settings: `HOME_FOLDER_ID`, `JOB_WORKBOOK_ID`, `COST_WORKBOOK_ID`, `INTAKE_SECRET` and optionally `DAILY_LIMIT` (default 30). Use the verified private home and workbooks. Keep their IDs outside the public repo. Generate a random secret of at least 32 bytes in a password manager or local terminal; do not paste it into chat. Use the identical secret in Vercel.
3. Deploy as a web app, executing as the owner. Google will request Drive and Sheets access. The owner must review and authorize this access. This is persistent access for the adapter to create project folders and append an intake queue. No mail permission is needed. Make the endpoint callable without a Google login; the script validates signed, short-lived server requests before doing any work. Do not change Drive folder sharing.
4. In this Vercel project's server environment, set `PRESSWRK_INTAKE_URL` to the deployment `/exec` URL, `PRESSWRK_INTAKE_SECRET` to the shared secret, and `PRESSWRK_PUBLIC_ORIGIN` to the production origin. Redeploy. Never use `VITE_`, `NEXT_PUBLIC_`, or browser storage for these values.
5. Submit a synthetic test under `QA — Website Intake`, using `qa@example.com`, a sample file and no real customer data. Verify folder contents, artwork checksum, private sharing, and the Website Intake row. Retry the exact submission and verify there is still one project/row. Keep the test visibly labeled QA. Then confirm the customer flow in the stable production site.

## Saved structure

`PRESSWRK home / Website Intake / Business — client-key / PW-submission-id — project /`

- `01 Artwork`: original uploaded PDF/JPG/PNG.
- `02 Project Brief`: readable brief, machine-readable project/check report.
- `03 Estimate`: quantity, versions, dimensions, net bounding-box area, material/finish and a private reference to the existing comprehensive cost workbook. Unknown waste, ink, labor, finishing and price remain pending.
- Receipt/fingerprint records support safe retries and detect changed submissions.

The job-control workbook gets a new **Website Intake** queue, preserving its existing Job Control and Line Items. The production cost dashboard is referenced, not modified. An operator reviews the intake, assigns the operational Job ID, prepares costing using actual rates, and enters reviewed rows into Job Control/Line Items. Proof approval, material qualification, payment and production gates stay under human control.

## Boundaries and maintenance

- 3 MB submission limit keeps base64 plus context under a conservative server body limit. Local checks allow 25 MB. Larger-file intake requires a separate resumable upload implementation.
- SHA-256 binds the submitted file to its report. Client-generated check claims are explicitly unverified on the server; the server never trusts a client-provided approval status.
- Same-origin submission, signed Google requests, a one-hour per-source cap and a daily global cap reduce accidental/automated abuse. Google cache rate limits are best effort. Monitor quotas and add durable bot protection if traffic grows.
- Client folders group normalized business plus email, avoiding name-only collisions. Different contacts at one client may create separate folders; the operator can reconcile them after verifying identity.
- Partial writes are retried without replacing existing original files. The adapter writes its receipt last. An ambiguous failure asks the client to retry with the same reference.
- Submissions are private and no email is sent automatically. Retention is managed by the owner in Drive. Never use public-link sharing on the intake root.
- Setting only the Vercel variables makes availability report enabled. Therefore verify Google first; configuration presence is not a health check.
