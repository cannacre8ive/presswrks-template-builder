# What release status means

- **Saved (committed):** a named snapshot exists in Git history on the local computer.
- **On GitHub (pushed):** that snapshot is uploaded to the repository.
- **Live (deployed):** Vercel has published it and the stable public link has been verified.

A commit ID is a version receipt, not an approval request. A local commit alone does not prove a push or deployment. Connected GitHub pushes trigger Vercel deployments, but the build and public page still need checking.

Each update should finish with these three states and a working link. Use one commit for a small finished change when practical. More commits are normal for later fixes; the user does not need to approve every snapshot unless approval is explicitly requested.

Git history preserves project files. It is separate from assistant memory. The Home library provides access to the project and should be updated when its name, status or public link changes. An idea mentioned in chat is not automatically a deployed feature.
