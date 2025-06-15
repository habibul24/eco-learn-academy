
/**
 * Extract YouTube video ID from almost any YouTube URL (standard, short, embed, nocookie, etc)
 */
export function getYoutubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  // Support various formats:
  // - https://www.youtube.com/watch?v=XXXXXXX
  // - https://youtu.be/XXXXXXX
  // - https://youtube.com/embed/XXXXXXX
  // - https://www.youtube-nocookie.com/embed/XXXXXXX
  // Grab the 11-char ID after v=, /embed/, /e/, /v/, youtu.be/ etc
  const youtubeRegex =
    /(?:youtube(?:-nocookie)?\.com\/.*(?:v=|embed\/|e\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  return match ? match[1] : null;
}
