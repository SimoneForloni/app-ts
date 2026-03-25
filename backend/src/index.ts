import { jwt } from 'hono/jwt'
import { env } from 'hono/adapter'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import * as auth from './controllers/authController'
import * as proj from './controllers/projectController'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'

type Variables = {
  jwtPayload: {
    sub: number
    username: string
    exp: number
  }
}

const app = new OpenAPIHono<{ Variables: Variables }>()

// --- MIDDLEWARES ---
app.use('*', logger(), cors())

// Middleware JWT per rotte protette
app.use('/api/protected/*', async (c, next) => {
  const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c)
  const jwtMiddleware = jwt({
    secret: JWT_SECRET || 'segreto_di_emergenza_cambiami',
    alg: 'HS256',
  })
  return jwtMiddleware(c, next)
})

// --- SCHEMI ZOD (CONTRATTI) PER SWAGGER ---

// 1. Schema Registrazione
const registerRoute = createRoute({
  method: 'post',
  path: '/api/auth/register',
  summary: 'Registra un nuovo utente',
  request: {
    body: {
      content: { 'application/json': { 
        schema: z.object({
          username: z.string().min(3).openapi({ example: 'simone' }),
          email: z.string().email().openapi({ example: 'simone@test.it' }),
          password: z.string().min(8).openapi({ example: 'password123' }),
        }) 
      } },
    },
  },
  responses: {
    201: { description: 'Utente creato' },
    400: { description: 'Dati non validi' },
  },
})

// 2. Schema Login
const loginRoute = createRoute({
  method: 'post',
  path: '/api/auth/login',
  summary: 'Effettua il login e ottieni il JWT',
  request: {
    body: {
      content: { 'application/json': { 
        schema: z.object({
          email: z.string().email().openapi({ example: 'simone@test.it' }),
          password: z.string().openapi({ example: 'password123' }),
        }) 
      } },
    },
  },
  responses: {
    200: { description: 'Login OK, restituisce Token' },
    401: { description: 'Credenziali errate' },
  },
})

// 3. Schema Creazione Progetto (Protetta)
const createProjectRoute = createRoute({
  method: 'post',
  path: '/api/protected/projects',
  summary: 'Crea un nuovo progetto (Richiede JWT)',
  security: [{ BearerAuth: [] }], // Indica che serve il token in Swagger
  request: {
    body: {
      content: { 'application/json': { 
        schema: z.object({
          title: z.string().min(2).openapi({ example: 'Mio Social App' }),
          description: z.string().optional().openapi({ example: 'Un mix tra IG e GitHub' }),
        }) 
      } },
    },
  },
  responses: {
    201: { description: 'Progetto creato' },
    401: { description: 'Non autorizzato' },
  },
})

// 4. Schema Profilo "Me" (Protetta)
const meRoute = createRoute({
  method: 'get',
  path: '/api/protected/me',
  summary: 'Ottieni info sull\'utente loggato',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'Dati utente recuperati' },
    401: { description: 'Token mancante o scaduto' },
  },
})

// --- IMPLEMENTAZIONE ROTTE ---

// Rotta root (semplice)
app.get('/', (c) => c.json({ message: 'Hono Backend is flying! 🚀' }))

// Rotte documentate
app.openapi(registerRoute, auth.register)
app.openapi(loginRoute, auth.login)
app.openapi(createProjectRoute, proj.createProject)
app.openapi(meRoute, (c) => {
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

// --- CONFIGURAZIONE SWAGGER / OPENAPI ---

// 1. Registriamo lo schema di sicurezza (BearerAuth) separatamente per evitare errori TS
app.openAPIRegistry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
})

// 2. Definiamo il documento OpenAPI (Senza la proprietà 'components')
app.doc('/api/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'IG + GitHub API',
    description: 'Documentazione completa del social network per sviluppatori'
  }
})

// 3. Interfaccia grafica Swagger
app.get('/ui', swaggerUI({ url: '/api/doc' }))

// --- AVVIO SERVER ---

const port = 3000
console.log(`\n🚀 Server pronto su http://localhost:${port}`)
console.log(`📜 Swagger UI su http://localhost:${port}/ui\n`)

serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0'
})