# Match report content workflow

Match reports are Markdown or MDX files in `src/content/blog/`. Astro validates each post's frontmatter against the blog collection schema and renders it into the existing blog, post, and RSS routes. Content is versioned with the site source; no database or separate CMS is required.

## Write a report

Create a file with a descriptive, URL-friendly name, such as `2026-10-25-club-v-opposition.md`, in `src/content/blog/`. Start with this frontmatter:

```md
---
title: 'Club v Opposition: Match Report'
description: 'A short summary of the match for the blog and search results.'
author: 'author'
pubDate: '2026-10-25'
draft: true
---
```

The `author` value must match an author entry ID under `src/content/authors/`. `pubDate` is the publication date. `draft` is optional and defaults to `false`; keep it `true` while the report is being prepared. You can also add `updatedDate` when correcting a published report and `heroImage` for an image stored in the project's assets.

Write the body in Markdown, for example:

```md
## First half

Describe the key moments and score progression.

## Second half

Describe how the match was decided.

**Final score:** Club 2-10, Opposition 1-12
```

For Markdown, save the file with a `.md` extension. Use `.mdx` instead if the report needs to import and embed an Astro component; MDX support is already configured for this site.

## Publish

1. Preview and edit the report while `draft: true`.
2. Set `draft: false` or remove the `draft` line when it is ready.
3. Commit and push the content file through the normal site deployment workflow.

The next site build includes the report in the blog index, its `/blog/<filename>/` page, and the RSS feed. Draft posts are excluded from all three.
