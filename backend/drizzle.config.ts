import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schemes',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgres://user:password@localhost:5432/nest_db", // Nota: localhost qui perché lo lanci da Arch, non da dentro Docker
  },
});