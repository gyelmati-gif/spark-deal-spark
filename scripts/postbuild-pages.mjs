import { copyFileSync, existsSync, cpSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// GitHub Pages publishes a single folder. We build a SPA into dist/client,
// then flatten it into dist/ so the workflow's `publish_dir: ./dist` works.
const clientDir = "dist/client";
const outDir = "dist";
const shell = join(clientDir, "_shell.html");

if (!existsSync(shell)) {
  console.error(`[postbuild] Missing ${shell} — SPA prerender did not run.`);
  process.exit(1);
}

// Promote _shell.html to index.html + 404.html (SPA fallback for deep links).
copyFileSync(shell, join(clientDir, "index.html"));
copyFileSync(shell, join(clientDir, "404.html"));

// Flatten dist/client/* up to dist/ and drop the unused server bundle.
cpSync(clientDir, outDir, { recursive: true });
rmSync(clientDir, { recursive: true, force: true });
rmSync("dist/server", { recursive: true, force: true });
rmSync(join(outDir, "_shell.html"), { force: true });

// Disable Jekyll so Pages serves files/folders starting with `_`.
writeFileSync(join(outDir, ".nojekyll"), "");

console.log("[postbuild] dist/ ready for GitHub Pages");