import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { db } from './db/db'
import { register } from './controllers/authController.ts'

const app = new Hono()
app.use('*', logger(), cors())

app.get('/', (c) => c.json({ message: 'Hono Backend is flying! 🚀' }))

app.post('/api/auth/register', register)

console.log('Server in ascolto sulla porta 3000...')

serve({
  fetch: app.fetch,
  port: 3000,
  hostname: '0.0.0.0'
});

