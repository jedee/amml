// Route that serves the AMML standalone HTML
// Mounted BEFORE the Vite SPA middleware so it takes priority
import { serveStatic } from 'hono/bun';

const AMML_PATH = '/home/workspace/amml-v4-final.html';

export default {
  port: 54305,
  fetch: async (req: Request) => {
    const url = new URL(req.url);
    if (url.pathname === '/' || url.pathname === '/amml') {
      const file = Bun.file(AMML_PATH);
      if (await file.exists()) {
        return new Response(file, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        });
      }
    }
    return new Response('Not found', { status: 404 });
  },
};
