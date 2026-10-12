const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const articlesDirectory = path.join(__dirname, "..", "articles");
const outputFile = path.join(__dirname, "..", "js", "data.js");
const themesFile = path.join(__dirname, "..", "themes", "themes.json");
const themes = JSON.parse(fs.readFileSync(themesFile, "utf8"));
const themeNames = new Set(themes.map(t => t.name));
const themesByIdentifier = new Map(themes.flatMap(t => [[t.name, t], [t.slug, t]]));
if (themeNames.size !== themes.length || new Set(themes.map(t => t.slug)).size !== themes.length) throw new Error("Theme names and slugs must be unique");

const files = fs
  .readdirSync(articlesDirectory)
  .filter(file => file.endsWith(".md"));

const essays = files.map(file => {
  const fullPath = path.join(articlesDirectory, file);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const { data, content } = matter(fileContents);

  const id = path.basename(file, ".md");

  const requiredFields = [
    "title",
    "author",
    "submission",
    "date",
    "excerpt"
  ];

  for (const field of requiredFields) {
    if (data[field] === undefined) {
      throw new Error(
        `${file} is missing required field: ${field}`
      );
    }
  }

  if (!["Rolling", "Thematic"].includes(data.submission)) throw new Error(`${file}: submission must be Rolling or Thematic`);
  const matchedTheme = data.theme == null ? null : themesByIdentifier.get(data.theme);
  if (data.theme != null && !matchedTheme) throw new Error(`${file}: unknown theme ${data.theme}`);
  if (data.submission === "Thematic" && !data.theme) throw new Error(`${file}: Thematic submissions require a theme`);

  return {
    id,
    title: data.title,
    author: data.author,
    submission: data.submission,
    theme: matchedTheme ? matchedTheme.name : null,
    date: data.date,
    featured: data.featured === true,
    excerpt: data.excerpt,
    note: data.note,

    content: content.trim()
  };
});

essays.sort((a, b) => {
  return new Date(b.date) - new Date(a.date);
});

const output =
  `// THIS FILE IS GENERATED AUTOMATICALLY.\n` +
  `// Do not edit it manually.\n\n` +
  `const ESSAYS = ${JSON.stringify(essays, null, 2)};\n` +
  `const THEMES = ${JSON.stringify(themes, null, 2)};\n`;

fs.writeFileSync(outputFile, output);

console.log(`Built article index with ${essays.length} article(s).`);