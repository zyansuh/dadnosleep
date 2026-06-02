import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { authApiMiddleware } from './server/auth/viteMiddleware'
import { discordApiMiddleware } from './server/discord/viteMiddleware'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'auth-api-dev',
      configureServer(server) {
        server.middlewares.use(authApiMiddleware())
        server.middlewares.use(discordApiMiddleware())
      },
    },
  ],
})
