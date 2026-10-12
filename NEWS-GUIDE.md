# News and announcements

Edit `js/news-data.js` to add, remove or update news posts. No `npm run build` is required for news alone.

Each object in `NEWS_POSTS` needs:

- `id`: a unique, URL-safe identifier (changing it breaks existing links)
- `title`: headline shown on its banner and detail page
- `date`: `YYYY-MM-DD` (news is automatically sorted newest first)
- `summary`: the short banner description
- `body`: an array of paragraphs displayed on the linked announcement page

The News page (`news/news.html`) uses the exact banner styling of the Themes page, and links to `news/post.html?id=your-id`.

For example:

```js
{
  id: "new-issue",
  title: "A New Issue",
  date: "2026-10-12",
  summary: "Lorem ipsum dolor sit amet.",
  body: ["Lorem ipsum dolor sit amet.", "Consectetur adipiscing elit."]
}
```

Keep the commas between objects in the `NEWS_POSTS` array.
