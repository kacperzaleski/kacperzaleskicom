/**
 * Public path for a page URL. With build.format "file", Astro renders pages
 * as /cv.html (and /index.html), but they're served as /cv and /.
 */
export function publicPath(pathname: string): string {
  return pathname.replace(/(\/index)?\.html$/, "").replace(/\/$/, "") || "/";
}
