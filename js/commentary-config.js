/*
 * Reader submission form configuration.
 * Current URL is the existing general submission form as a temporary fallback.
 * Replace it with a dedicated Google Form for commentary when ready.
 *
 * For automatically pre-filling the original article:
 *   1. In the dedicated form, create a Short answer question named "Original article".
 *   2. In Google Forms, choose "Get pre-filled link" and fill that question.
 *   3. Copy the FULL docs.google.com/forms/.../viewform URL (not a forms.gle short link).
 *   4. Put that URL in url and the number after "entry." into articleFieldEntry.
 *      E.g. for entry.123456789=..., use articleFieldEntry: "123456789".
 * When articleFieldEntry is empty, readers are explicitly told to name the article.
 */
const COMMENTARY_FORM = {
  url: "https://forms.gle/k7MbpRyKsiy3PNnt8",
  articleFieldEntry: ""
};
