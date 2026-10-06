import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// In `npm run dev`, serve the Vercel functions in api/ so the MCC Finder works
// locally. Server-only keys (ANTHROPIC_API_KEY, TYPESAFE_API_KEY) are read from
// .env.local without the VITE_ prefix, so they never reach the browser bundle.
function vercelApiDev() {
  return {
    name: 'vercel-api-dev',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''))
      server.middlewares.use(async (req, res, next) => {
        const path = req.url.split('?')[0]
        if (!/^\/api\/mcc\/[a-z]+$/.test(path)) return next()
        try {
          const mod = await server.ssrLoadModule(`${path}.js`)
          await mod.default(req, res)
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiDev()],
})
