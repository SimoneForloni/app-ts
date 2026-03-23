import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import * as auth from './controllers/authController'

const app = new Hono()
app.use('*', logger(), cors())

app.get('/', (c) => c.json({ message: 'Hono Backend is flying! 🚀' }))

app.post('/api/auth/register', auth.register)
app.post('/api/auth/login', auth.login)

console.log('Server in ascolto sulla porta 3000...')

serve({
  fetch: app.fetch,
  port: 3000,
  hostname: '0.0.0.0'
});

