import { serveStatic } from "hono/bun";
import { createServer as createViteServer } from "vite";
import config from "./zosite.json";
import { Hono } from "hono";
const app = new Hono();
const mode = process.env.NODE_ENV === "production" ? "production" : "development";
async function serveAMML(c) {
    // In production, always read from public/ so we get the latest without rebuilding
    const base = mode === "production" ? "./public" : ".";
    const file = Bun.file(`${base}/amml.html`);
    if (await file.exists()) {
        return new Response(file, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-store, must-revalidate, max-age=0",
            },
        });
    }
    // Fallback to dist in dev
    const fallback = Bun.file(`./dist/amml.html`);
    if (await fallback.exists()) {
        return new Response(fallback, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-store, must-revalidate, max-age=0",
            },
        });
    }
    return c.text("AMML app not found", 404);
}
app.get("/app", serveAMML);
app.get("/app/*", serveAMML);
if (mode === "production") {
    configureProduction(app);
}
else {
    await configureDevelopment(app);
}
const port = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : mode === "production"
        ? (config.publish?.published_port ?? config.local_port)
        : config.local_port;
export default { fetch: app.fetch, port, idleTimeout: 255 };
function configureProduction(app) {
    app.use("/assets/*", serveStatic({ root: "./dist" }));
    app.get("/favicon.ico", (c) => c.redirect("/favicon.svg", 302));
    app.use(async (c, next) => {
        if (c.req.method !== "GET")
            return next();
        const path = c.req.path;
        if (path.startsWith("/api/") || path.startsWith("/assets/"))
            return next();
        // Serve React app at root
        if (path === "/" || path === "") {
            const distIndex = Bun.file("./dist/index.html");
            if (await distIndex.exists()) {
                return new Response(distIndex, {
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                });
            }
        }
        const pub = Bun.file(`./public${path}`);
        if (await pub.exists()) {
            const stat = await pub.stat();
            if (stat && !stat.isDirectory())
                return new Response(pub);
        }
        return serveAMML(c);
    });
}
async function configureDevelopment(app) {
    const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false, ws: false },
        appType: "custom",
    });
    app.use("*", async (c, next) => {
        if (c.req.path.startsWith("/api/"))
            return next();
        if (c.req.path === "/favicon.ico")
            return c.redirect("/favicon.svg", 302);
        const url = c.req.path;
        if (url === "/" || url === "/index.html") {
            const pub = Bun.file("./public/index.html");
            if (await pub.exists()) {
                return new Response(pub, {
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                });
            }
            let template = await Bun.file("./index.html").text();
            template = await vite.transformIndexHtml(url, template);
            return c.html(template, {
                headers: { "Cache-Control": "no-store, must-revalidate" },
            });
        }
        const publicFile = Bun.file(`./public${url}`);
        if (await publicFile.exists()) {
            const stat = await publicFile.stat();
            if (stat && !stat.isDirectory())
                return new Response(publicFile);
        }
        let result;
        try {
            result = await vite.transformRequest(url);
        }
        catch {
            result = null;
        }
        if (result) {
            return new Response(result.code, {
                headers: {
                    "Content-Type": "application/javascript",
                    "Cache-Control": "no-store, must-revalidate",
                },
            });
        }
        return serveAMML(c);
    });
    return vite;
}
