import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schemes/schema.ts'

// Usa le credenziali che abbiamo messo nel docker-compose.yml
const pool = new pg.Pool({
  connectionString: "postgres://user:password@db:5432/nest_db",
});

export const db = drizzle(pool, {schema});