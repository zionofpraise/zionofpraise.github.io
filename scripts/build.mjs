import { copyFileSync, readdirSync, writeFileSync } from "node:fs";

const outputPath = new URL("../index.html", import.meta.url);

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

function getPhotosBySunday(sundays) {
  const sundaySet = new Set(sundays);
  const photosUrl = new URL(`../photos/`, import.meta.url);
  const groups = {};

  readdirSync(photosUrl, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\./.test(name))
    .forEach((name) => {
      const date = name.slice(0, 10);
      if (!sundaySet.has(date)) return;
      if (!groups[date]) groups[date] = [];
      groups[date].push(name);
    });

  for (const date of Object.keys(groups)) {
    groups[date].sort((a, b) => a.localeCompare(b, "en"));
  }

  return groups;
}

function getLatestPhotoName() {
  const photosUrl = new URL(`../photos/`, import.meta.url);
  const photos = readdirSync(photosUrl, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\./.test(name))
    .sort((a, b) => a.localeCompare(b, "en"));

  return photos.length > 0 ? photos[photos.length - 1] : null;
}

function renderPhotos(entry) {
  return entry.photos
    .map((photo) => {
      const safePhoto = escapeHtml(photo);
      const alt = escapeHtml(`${dateFormatter.format(new Date(`${entry.date}T00:00:00Z`))} photo`);

      return `            <figure class="photo-frame">
              <img src="./photos/${safePhoto}" alt="${alt}" loading="lazy" />
            </figure>`;
    })
    .join("\n");
}

function renderEntry(entry) {
  return `        <section class="sunday-card">
          <div class="sunday-head">
            <h2 class="sunday-title">Week #${entry.weekNumber}: ${entry.date}</h2>
          </div>
          <div class="photo-grid">
${renderPhotos(entry)}
          </div>
        </section>`;
}

const sundays = getSundaysFor2026();
const photosBySunday = getPhotosBySunday(sundays);

const entries = sundays
  .map((date, index) => ({ date, photos: photosBySunday[date] || [], weekNumber: index + 1 }))
  .filter((entry) => entry.photos.length > 0)
  .reverse();

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <link rel="icon" type="image/png" href="https://zionofpraise.github.io/favicon.png" />

    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <meta property="og:image" content="https://zionofpraise.github.io/thumbnail.jpg" />

    <title>CBCF - 52 weeks of ZOP (2026)</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main class="page">
      <header class="hero">
        <h1>52 weeks of <span class="tooltip-container" data-tooltip="Zion of Praise">ZOP</span> (2026)</h1>
      </header>

      <div class="gallery">
${entries.map(renderEntry).join("\n")}
      </div>
    </main>
  </body>
</html>
`;

writeFileSync(outputPath, html);

const latestPhoto = getLatestPhotoName();
if (latestPhoto) {
  copyFileSync(
    new URL(`../photos/${latestPhoto}`, import.meta.url),
    new URL("../thumbnail.jpg", import.meta.url)
  );
}
