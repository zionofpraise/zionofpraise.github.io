# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build    # regenerate index.html and thumbnail.jpg from photos/
npm run counter  # start local attendance counter server at http://localhost:3000
```

No lint or test commands exist.

## Architecture

Two independent tools share this repo:

### 1. Static photo gallery (deployed)

`scripts/build.mjs` generates `index.html` at the repo root. It:
- Computes all Sundays in 2026
- Reads `photos/` (flat directory) for files matching `YYYY-MM-DD.*`
- Only includes files whose date is an actual 2026 Sunday
- Renders entries in reverse-chronological order, newest week first
- Copies the lexicographically last photo to `thumbnail.jpg` (used as OG image)

`index.html` and `thumbnail.jpg` are **gitignored** — they exist only after a local build or in CI. GitHub Actions runs `npm run build` on every push to `main` then deploys the entire repo directory as a GitHub Pages artifact.

Photo naming: `photos/YYYY-MM-DD.jpg` (flat files, not subdirectories — the README is outdated on this point).

### 2. Local attendance counter (not deployed)

`server.js` + `counter.html` + `counter.js` form a local Express app for tracking how many Sundays each member has attended. State persists to `counter-data.json` (gitignored). Endpoints: `GET /api/data`, `POST /api/increment`, `POST /api/decrement`, `POST /api/reset`, `POST /api/import`.

The member list and initial counts live in `server.js` as `initialData`. Resetting via `/api/reset` restores these values.
