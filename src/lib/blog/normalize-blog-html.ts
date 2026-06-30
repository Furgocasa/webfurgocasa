function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitleKey(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function headingsMatchTitle(headingHtml: string, title: string): boolean {
  const headingKey = normalizeTitleKey(stripTags(headingHtml));
  const titleKey = normalizeTitleKey(title);
  if (!headingKey || !titleKey) return false;
  if (headingKey === titleKey) return true;
  const shorter = headingKey.length <= titleKey.length ? headingKey : titleKey;
  const longer = headingKey.length > titleKey.length ? headingKey : titleKey;
  return longer.includes(shorter) && shorter.length >= Math.min(titleKey.length, headingKey.length) * 0.85;
}

/** Quita h1/h2 inicial si repite el título del post (ya visible en la cabecera de la página). */
export function stripDuplicateTitleHeading(html: string, title: string): string {
  let out = html.trim();
  const leadingHeading = out.match(/^<h[12][^>]*>([\s\S]*?)<\/h[12]>\s*/i);
  if (leadingHeading && headingsMatchTitle(leadingHeading[1], title)) {
    out = out.slice(leadingHeading[0].length).trim();
  }
  return out;
}

/** Espaciado legible entre bloques en el HTML fuente (editor/admin). */
export function formatBlogHtmlBlockSpacing(html: string): string {
  return html
    .replace(/<\/p>\s*<h2/gi, "</p>\n\n<h2")
    .replace(/<\/p>\s*<h3/gi, "</p>\n\n<h3")
    .replace(/<\/ul>\s*<h2/gi, "</ul>\n\n<h2")
    .replace(/<\/ol>\s*<h2/gi, "</ol>\n\n<h2")
    .replace(/<\/h2>\s*<p/gi, "</h2>\n\n<p")
    .replace(/<\/h3>\s*<p/gi, "</h3>\n\n<p");
}

export function normalizeBlogArticleHtml(html: string, title: string): string {
  const withoutDuplicateTitle = stripDuplicateTitleHeading(html, title);
  return formatBlogHtmlBlockSpacing(withoutDuplicateTitle);
}
