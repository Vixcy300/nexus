import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/send-confirmation' || req.url?.startsWith('/api/send-confirmation?')) {
          if (req.method === 'POST') {
            let rawBody = '';
            req.on('data', chunk => { rawBody += chunk; });
            req.on('end', async () => {
              try {
                req.body = JSON.parse(rawBody || '{}');
                res.status = (code) => { res.statusCode = code; return res; };
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return res;
                };
                const { default: handler } = await import('./api/send-confirmation.js');
                await handler(req, res);
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevServerPlugin()],
})
