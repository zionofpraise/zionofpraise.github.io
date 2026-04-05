# 2026 Sundays Photo Site

This is a plain static site that can be deployed directly with GitHub Pages.
The final site contains no browser-side JavaScript.

## How to use

1. Put photos for a Sunday in `photos/YYYY-MM-DD/`.
2. Run `npm run build` to regenerate `index.html`.
3. Push to `main` and let GitHub Pages deploy from the workflow.

The site will render each Sunday as a section header and show every listed image
for that date based on the files present in each folder.
