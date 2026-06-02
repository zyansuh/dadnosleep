import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { authApiMiddleware } from './server/auth/viteMiddleware'
import { discordApiMiddleware } from './server/discord/viteMiddleware'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix → .env.local 의 DISCORD_* 등 서버 전용 변수도 process.env 에 주입 (dev API 미들웨어용)
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = value
    }
  }

  return {
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
  }
})
