/* File Handler Stuff */
// its going here to keep things from getting burried :)

import { Request, Response } from "express";
import { contentDir, templatesDirs } from "../constants";
import { join, sep } from "node:path";
import { createReadStream, readFileSync, statSync } from "node:fs";
import { EOL } from "node:os";
import { tmpl } from "./tmpl";

function getMimeForExt(ext: string) {
  const map: any = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    pdf: 'application/pdf',
    txt: 'text/plain; charset=utf-8',
    md: 'text/markdown; charset=utf-8',
    html: 'text/html; charset=utf-8',
    css: 'text/css; charset=utf-8',
    js: 'application/javascript; charset=utf-8',
    json: 'application/json; charset=utf-8'
  };
  return map[ext] || 'application/octet-stream';
}

const EMBED_MAX_BYTES = parseInt(process.env.BACKWARDSAPI_EMBED_MAX || '262144', 10);

function NotFound(res: Response) {
  res.status(404).end();
  return;
}

function streamRawFile(req: Request, res: Response, filePath: string, ext: string, d: boolean = false) {
  let stat;
  try {
    stat = statSync(filePath);
  } catch (e) {
    return NotFound(res)
  }

  const mime = getMimeForExt(ext);
  res.setHeader('Content-Type', mime);
  res.setHeader('Accept-Ranges', 'bytes');

  const filename = filePath.split(sep).pop();
  const disposition = d ? 'attachment' : 'inline';
  if (filename === undefined) return NotFound(res);
  res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);

  const range = req.headers.range;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      res.status(416).end();
      return;
    }
    let start = match[1] ? parseInt(match[1], 10) : 0;
    let end = match[2] ? parseInt(match[2], 10) : stat.size - 1;

    if (isNaN(start) || start < 0) start = 0;
    if (isNaN(end) || end >= stat.size) end = stat.size - 1;
    if (start > end) {
      res.status(416).setHeader('Content-Range', `byes */${stat.size}`).end();
      return;
    }

    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
    res.setHeader('Content-Length', end - start + 1);

    const stream = createReadStream(filePath, { start, end });
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } else {
    res.status(200);
    res.setHeader('Content-Length', stat.size);
    const stream = createReadStream(filePath);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  }
}

export function HandleFileRequest(url: string[], req: Request, res: Response) {
  const filePath = join(contentDir, url.join('/'));
  const lastPart = url.pop();
  const from = url.slice(0, -1).join("/");

  const download = req.query["d"];
  const ext = lastPart?.split('.').pop()?.toLowerCase();

  if (download !== undefined) {
    if (ext === undefined)
      return;
    streamRawFile(req, res, filePath, ext, true);
    return
  }

  if (ext === "js") {
    const fileContent = readFileSync(filePath);
    const scriptContent = fileContent.toString();
    if (scriptContent.split(EOL)[0] === "/* -- execute -- */") {
      const script = require(filePath);
      if (script.main) {
        const scriptRes = script.main(req, res);
        if (scriptRes === true || res.headersSent) {
          return;
        }
        res.send(scriptRes);
        return;
      }
    }
  }

  const { types } = require('../data/mediatypes.json');
  const kind = types[ext ?? ""];

  const templatePath = join(templatesDirs, `backwards_api_file.css`);
  const css = readFileSync(templatePath).toString() ?? "";

  if (kind === "text") {
    const fileContent = readFileSync(filePath);


    const replacers = [
      ["{css}", css],
      ["{title}", "Backwards API"],
      ["{back}", from],
      ["{language}", ext ?? ""],
      ["{content}", fileContent.toString()]
    ]

    res.status(200).send(tmpl("text", replacers));
  }

  try {
    const { size } = statSync(filePath);
    if (size << EMBED_MAX_BYTES && kind) {
      const fileContent = readFileSync(filePath);

      const replacers = [
        ["{css}", css],
        ["{title}", "Backwards API"],
        ["{back}", from],
        ["{content}", fileContent.toString()]
      ]

      res.status(200).send(tmpl("etc", replacers))
    } else {
      streamRawFile(req, res, filePath, ext ?? "", false)
    }
  } catch (e) {
    res.status(404).end();
  }
  return;
}