import { serveStatic } from "hono/bun";
import type { ViteDevServer } from "vite";
import { createServer as createViteServer } from "vite";
import config from "./zosite.json";
import { Hono } from "hono";

type Mode = "development" | "production";
const app = new Hono();

const mode: Mode =
  process.env.NODE_ENV === "production" ? "production" : "development";

if (mode === "production") {
  configureProduction(app);
} else {
  await configureDevelopment(app);
}

const port = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : mode === "production"
    ? (config.publish?.published_port ?? config.local_port)
    : config.local_port;

export default { fetch: app.fetch, port, idleTimeout: 255 };

// ── Production ─────────────────────────────────────────────
function configureProduction(app: Hono) {
  app.use("/assets/*", serveStatic({ root: "./dist" }));
  app.get("/favicon.ico", (c) => c.redirect("/favicon.svg", 302));
  app.use("*", async (c, next) => {
    if (c.req.method !== "GET") return next();
    const path = c.req.path;
    if (path.startsWith("/api/") || path.startsWith("/assets/")) return next();
    // Serve React app for root
    if (path === "/" || path === "") {
      const distIndex = Bun.file("./dist/index.html");
      if (await distIndex.exists()) {
        return new Response(distIndex, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }
    // Fallback: try public/ directory
    const pub = Bun.file(`./public${path}`);
    if (await pub.exists()) {
      const stat = await pub.stat();
      if (stat && !stat.isDirectory()) return new Response(pub);
    }
    // SPA fallback — serve index.html
    const index = Bun.file("./dist/index.html");
    if (await index.exists()) {
      return new Response(index, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return c.text("AMML not found", 404);
  });
}

// ── Development ────────────────────────────────────────────
async function configureDevelopment(app: Hono): Promise<ViteDevServer> {
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });

  app.use("*", async (c, next) => {
    if (c.req.path.startsWith("/api/")) return next();
    if (c.req.path === "/favicon.ico") return c.redirect("/favicon.svg", 302);

    const url = c.req.path;

    // Serve root index.html through Vite
    if (url === "/" || url === "/index.html") {
      let template = await Bun.file("./index.html").text();
      template = await vite.transformIndexHtml(url, template);
      return c.html(template, {
        headers: { "Cache-Control": "no-store, must-revalidate" },
      });
    }

    // Serve files from public/
    const publicFile = Bun.file(`./public${url}`);
    if (await publicFile.exists()) {
      const stat = await publicFile.stat();
      if (stat && !stat.isDirectory()) return new Response(publicFile);
    }

    // Let Vite handle everything else (JS, CSS, etc.)
    let result;
    try { result = await vite.transformRequest(url); } catch { result = null; }
    if (result) {
      return new Response(result.code, {
        headers: {
          "Content-Type": url.endsWith('.css') ? 'text/css' : 'application/javascript',
          "Cache-Control": "no-store, must-revalidate",
        },
      });
    }

    // Serve pre-built assets (from last production build) if available
    if (url.startsWith('/assets/')) {
      const file = Bun.file(`./dist${url}`);
      if (await file.exists()) {
        const ext = url.split('.').pop() ?? '';
        const ct = ext === 'js' ? 'application/javascript' : ext === 'css' ? 'text/css' : '';
        return new Response(file, { headers: ct ? { 'Content-Type': ct } : {} });
      }
    }

    // SPA fallback — serve index.html
    const index = Bun.file('./dist/index.html');
    if (await index.exists()) {
      return new Response(index, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return c.text('AMML not found', 404);
  });

  return vite;
}
