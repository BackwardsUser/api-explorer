/* This file will handle tmpl files */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { templatesDirs } from "../constants";


export function tmpl(tmplFile: string, replacers: string[][]) {
  const templatePath = join(templatesDirs, `${tmplFile}.tmpl`);
  const template = readFileSync(templatePath).toString();

  let builtHTML = template;

  replacers.forEach(rpl => {
    if (typeof rpl[0] === "string" && typeof rpl[1] === "string") {
      builtHTML = builtHTML.replace(rpl[0], rpl[1]);
    }
  });

  return builtHTML;
} 