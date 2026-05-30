// Estimates reading time from post content (HTML or plain text) at ~200 wpm.
export function readingTime(content = '') {
  const text = content.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
