import { serve } from "bun";
import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const PORT = process.env.PORT || 3000;
const ROOT = join(process.cwd(), "public");

serve({
  port: PORT,
  fetch(req) {
    let url = new URL(req.url).pathname;
    if (url === "/") url = "/index.html";
    const filePath = join(ROOT, url);

    if (existsSync(filePath)) {
      const ext = extname(filePath);
      const mime = MIME[ext] || "application/octet-stream";
      return new Response(readFileSync(filePath), {
        headers: { "Content-Type": mime, "Cache-Control": "public, max-age=3600" },
      });
    }

    // SPA fallback
    return new Response(readFileSync(join(ROOT, "index.html")), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
});

console.log("AMML running on port " + PORT);
