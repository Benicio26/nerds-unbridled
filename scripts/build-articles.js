const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const articlesDirectory = path.join(__dirname, "..", "articles");
const outputFile = path.join(__dirname, "..", "js", "data.js");

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
    "format",
    "category",
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

  return {
    id,
    title: data.title,
    author: data.author,
    format: data.format,
    category: data.category,
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
  `const ESSAYS = ${JSON.stringify(essays, null, 2)};\n`;

fs.writeFileSync(outputFile, output);

console.log(`Built article index with ${essays.length} article(s).`);