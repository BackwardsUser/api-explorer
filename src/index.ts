import express, { Request, Response } from "express";
import { join, sep } from "node:path";
import checkAuthenticationRequired from "./middleware/basicAuthentication";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { PackageWindow } from "./functions/packaging";
import { contentDir, PORT, templatesDirs } from "./constants";
import { tmpl } from "./functions/tmpl";
import { HandleFileRequest } from "./functions/files";

const app = express();

// auth groups using "()"

app.use(checkAuthenticationRequired, (req: Request, res: Response) => {
  let url = req.url.split("?").shift()?.slice(1).split("/");
  url = (!url || url === undefined || url[0] === "") ? [] : url;

  const request = join(contentDir, url?.join(sep));

  if (lstatSync(request).isFile()) {
    HandleFileRequest(url, req, res);
    return;
  }

  const currentDir = url.length === 0 ? contentDir : join(contentDir, url.join(sep))

  const content = readdirSync(currentDir);
  const html = PackageWindow(currentDir, content);

  if (!html) {
    res.status(500).json("Could not create HTML for the given route...");
  }

  const templatePath = join(templatesDirs, `backwards_api.css`);

  const replacers = [
    ["{css}", readFileSync(templatePath).toString()],
    ["{title}", "Backwards API"],
    ["{content}", html]
  ]

  res.send(tmpl("index", replacers));
  // res.status(501).json("Not Implemented");
});

app.listen(PORT, () => {
  console.log(`Application listening on port ${PORT}.`);
});