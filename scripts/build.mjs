import { readdirSync, writeFileSync } from "node:fs";

const outputPath = new URL("../index.html", import.meta.url);
const photosRoot = new URL("../photos/", import.meta.url);

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getSundaysFor2026() {
  const sundays = [];
  const current = new Date("2026-01-01T00:00:00Z");

  while (current.getUTCDay() !== 0) {
    current.setUTCDate(current.getUTCDate() + 1);
  }

  while (current.getUTCFullYear() === 2026) {
    sundays.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 7);
  }

  return sundays;
}

function getPhotosForDate(date) {
  const folderUrl = new URL(`../photos/${date}/`, import.meta.url);

  return readdirSync(folderUrl, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "en"));
}

function renderPhotos(entry) {
  return entry.photos
    .map((photo) => {
      const safePhoto = escapeHtml(photo);
      const alt = escapeHtml(`${dateFormatter.format(new Date(`${entry.date}T00:00:00Z`))} photo`);

      return `            <figure class="photo-frame">
              <img src="./photos/${entry.date}/${safePhoto}" alt="${alt}" loading="lazy" />
            </figure>`;
    })
    .join("\n");
}

function renderEntry(entry) {
  return `        <section class="sunday-card">
          <div class="sunday-head">
            <h2 class="sunday-title">${entry.date}</h2>
          </div>
          <div class="photo-grid">
${renderPhotos(entry)}
          </div>
        </section>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>2026 Sundays</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main class="page">
      <header class="hero">
        <h1>ZOP 2026</h1>
      </header>

      <div class="gallery">
${getSundaysFor2026()
  .map((date) => ({ date, photos: getPhotosForDate(date) }))
  .filter((entry) => entry.photos.length > 0)
  .reverse()
  .map(renderEntry)
  .join("\n")}
      </div>
    </main>
  </body>
</html>
`;

writeFileSync(outputPath, html);
