import { join } from "node:path";

export const PORT = 8080;

export const contentDirName = "content";
export const contentDir = join(__dirname, "..", contentDirName);

export const templatesDirName = "view";
export const templatesDirs = join(__dirname, templatesDirName);