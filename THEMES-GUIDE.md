# Themes and submissions

The `themes/themes.json` file defines the available thematic collections. Each object has a unique `slug`, a `name`, a lorem ipsum `description`, and an optional `startDate` (`YYYY-MM-DD`). Themes are shown even before any articles are assigned.

Article Markdown front matter now uses `submission: "Rolling"` or `submission: "Thematic"` and `theme: null` or `theme: "Use of Force in International Law"` (an exact name from the themes JSON file). **Thematic requires a theme; Rolling may have no theme or may be assigned a theme.** The old `category` and `format` fields are no longer used. Existing articles were preserved as Rolling without a theme; reassign them editorially as appropriate.

Run `npm install` and `npm run build` to regenerate `js/data.js` after updating either articles or themes. Commit the generated file with your changes when publishing. The Themes landing page is `themes/themes.html`; an individual theme is `themes/theme.html?slug=use-of-force-in-international-law`.
