import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schemes',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgres://user:password@localhost:5432/nest_db",
  },
});