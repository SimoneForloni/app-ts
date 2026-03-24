import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { env } from 'hono/adapter'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import * as auth from './controllers/authController'

type Variables = {
  jwtPayload: {
    sub: number
    username: string
    exp: number
  }
}

const app = new Hono<{ Variables: Variables }>()
app.use('*', logger(), cors())
app.use('/api/protected/*', async (c, next) => {
  const { JWT_SECRET } = env<{JWT_SECRET: string}>(c)

  const jwtMiddleware = jwt({
    secret: JWT_SECRET || 'segreto_di_emergenza_cambiami',
    alg: 'HS256',
  })

  return jwtMiddleware(c, next)
})

app.get('/', (c) => c.json({ message: 'Hono Backend is flying! 🚀' }))
app.get('/api/protected/me', (c) => {
  const payload = c.get('jwtPayload')

  return c.json({
    message: "Accesso autorizzato! 🔓",
    user: {
      id: payload.sub,
      username: payload.username,
      scadenza: new Date(payload.exp * 1000).toLocaleString()
    }
  })
})

app.post('/api/auth/register', auth.register)
app.post('/api/auth/login', auth.login)

console.log('Server in ascolto sulla porta 3000...')

serve({
  fetch: app.fetch,
  port: 3000,
  hostname: '0.0.0.0'
})

