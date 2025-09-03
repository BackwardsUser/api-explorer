import { lstatSync, readdirSync } from "node:fs";
import { join } from "node:path"
import { FullToShort, getEmojiForExtension, ShortToFull } from "./helpers";

function DirToHTML(shortPath: string, dirName: string) {
  return (
    `<div class="file dir"><a class="open" href="${join(shortPath)}">📁 ${dirName}</a></div>`
  )
}

function FileToHTML(shortPath: string, fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const emoji = getEmojiForExtension(ext ?? "");
  const dl = `${shortPath}?d`;
  return (`
  <div class="file">
    <a class="open" href="${shortPath}" aria-label="Open ${fileName}"><span>${emoji} ${fileName}</span></a>
    <a class="download" href="${dl}" aria-label="Download ${fileName}" title="Download">📥</a>
  </div>
  `)
}

function UnknownToHTML(shortPath: string, unknownName: string) {
  return (
    `<div class="file"><a class="open unknown" href="${shortPath}">❓ ${unknownName}</a></div>`
  );
}

type ContentType = {
  dirs: string[];
  files: string[];
  unknowns: string[];
}

function ContentFromPath(path: string) {
  const content: ContentType = {
    dirs: [],
    files: [],
    unknowns: []
  }
  console.log(path)
  const rawContent = readdirSync(path).filter(file => !file.startsWith("ignore_"));
  rawContent.forEach(item => {
    const stat = lstatSync(join(path, item));
    if (stat.isDirectory()) {
      content.dirs.push(item);
    } else if (stat.isFile()) {
      content.files.push(item);
    } else {
      content.unknowns.push(item);
    }
  });
  return content;
}

function ContentToHTML(content: ContentType, path: string, hasBack: boolean) {
  const html = [];
  if (hasBack) {
    const backPath = path.split('/').slice(0, -1).join('/');
    html.push(DirToHTML(backPath, ".."));
  }
  content.dirs.length > 0 && content.dirs.forEach((dir: string) => html.push(DirToHTML(FullToShort(join(path, dir)), dir)));
  content.files.length > 0 && content.files.forEach((file: string) => html.push(FileToHTML(FullToShort(join(path, file)), file)));
  content.unknowns.length > 0 && content.unknowns.forEach((unknown: string) => html.push(UnknownToHTML(FullToShort(join(path, unknown)), unknown)));
  return (
    `<div class="file-grid">\n${html.join("\n")}\n</div>`
  )
}

export function PackageWindow(path: string, contentNames: string[]) {
  const content = ContentFromPath(path)
  const shortPath = FullToShort(path)
  const html = ContentToHTML(content, shortPath, shortPath !== "");
  return html;
}