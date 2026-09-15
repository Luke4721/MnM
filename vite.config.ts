import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vercel compiles /api/*.ts into serverless functions. `vite dev` has no such
 * runtime, so this mounts the same handlers locally — otherwise every dev-mode
 * call to /api/* would fall through to the SPA and return index.html.
 *
 * Loaded through server.ssrLoadModule so Vite transpiles the handlers on demand;
 * they are never bundled into the browser build.
 */
const devApiRoutes: Record<string, string> = {
  '/api/create-order': '/api/create-order.ts',
  '/api/verify-payment': '/api/verify-payment.ts',
}

const devApiPlugin = (): Plugin => ({
  name: 'mnm-dev-api',
  apply: 'serve',
  configureServer(server) {
    // Secrets live in .env.local, which Vite does not put on process.env by default.
    const env = loadEnv(server.config.mode, process.cwd(), '')
    for (const [key, value] of Object.entries(env)) {
      if (process.env[key] === undefined) process.env[key] = value
    }

    server.middlewares.use((req, res, next) => {
      const path = req.url?.split('?')[0] ?? ''
      const modulePath = devApiRoutes[path]
      if (!modulePath) {
        next()
        return
      }

      server
        .ssrLoadModule(modulePath)
        .then((mod: { default?: (req: unknown, res: unknown) => Promise<void> }) => {
          if (typeof mod.default !== 'function') {
            res.statusCode = 500
            res.end(JSON.stringify({ error: `No default export in ${modulePath}` }))
            return
          }
          return mod.default(req, res)
        })
        .catch((error: unknown) => {
          console.error('[dev-api]', path, error)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
          }
          res.end(JSON.stringify({ error: 'Dev API handler failed. See the terminal for details.' }))
        })
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
