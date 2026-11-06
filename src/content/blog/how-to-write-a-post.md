---
title: How to write a post
subtitle: A template that shows everything a post can do. It's a draft, so it never goes live.
date: 2026-11-06
lang: en
tags: [meta]
draft: true
---

Copy this file, rename it (the file name becomes the URL: `my-post.md` →
`/blog/my-post`), change the header above, and write. While `draft: true` is
set, the post only shows up when you run `pnpm dev`.

## The header

| Field      | Required | What it does                                         |
| ---------- | -------- | ---------------------------------------------------- |
| `title`    | yes      | Big heading, list title, browser tab, social preview |
| `subtitle` | yes      | Shown under the title in the list and on the post    |
| `date`     | yes      | `YYYY-MM-DD`; the list is sorted by it, newest first |
| `lang`     | no       | `en` (default) or `de`, the language you write in    |
| `tags`     | no       | `[a, b]`, shown as little pills on the post          |
| `updated`  | no       | `YYYY-MM-DD`, shows "Updated …"                      |
| `cover`    | no       | Image path relative to the post, e.g. `./cover.jpg`  |
| `coverAlt` | no       | Describe the cover image for screen readers          |
| `draft`    | no       | `true` = only visible locally                        |

## Writing

Normal paragraphs, **bold**, _italic_, [links](https://kacperzaleski.com) and
`inline code` work as you'd expect.

- Lists
- work
  - and can be nested

1. Numbered
2. lists too

> Quotes look like this.

Code blocks get syntax highlighting that follows the light/dark switch:

```python
import torch

def denoise(x_t: torch.Tensor, t: int) -> torch.Tensor:
    return model(x_t, t)
```

---

## Images

Put the post in a folder to keep images next to it:

```
src/content/blog/my-post/index.md
src/content/blog/my-post/diagram.png
```

and reference them with `![What the image shows](./diagram.png)`. Images are
resized and compressed automatically at build time.

No photos of children (scouts!). Group-level or text only.
