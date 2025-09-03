import { sep } from "node:path";

/* Path converting */
export function FullToShort(path: string) {
  const idx = path.indexOf(`${sep}content${sep}`);
  if (idx === -1) return path;
  return path.slice(idx + "/content".length);
}

export function ShortToFull(path: string) {
  console.log(path);
}

export function getEmojiForExtension(ext: string) {
  // Map file extensions to Devicon class names
  const iconMap: any = {
    js: 'javascript',
    ts: 'typescript',
    json: 'json',
    py: 'python',
    svg: 'svg'
  };
  if (!iconMap[ext]) {
    const emojiMap: any = {
      png: "🖼️",
      jpg: "🖼️",
      jpeg: "🖼️",
      gif: "🖼️",
      webp: "🖼️",
      ico: "⭐",
      md: "📄",
      txt: "📄",
      json: "🗒️",
      html: "🌐",
      css: "🎨",
      mp3: "🎵",
      mp4: "🎬",
      zip: "🗜️",
      pdf: "📕"
    };
    if (emojiMap[ext]) return emojiMap[ext];
    return "📄"
  }
  const icon = iconMap[ext];
  return `<img height="16" width="16" style="transform: translate(0, 3px);" src="https://cdn.simpleicons.org/${icon}" />`;
}