#!/bin/sh

echo "Attesa che il database sia pronto..."
# Opzionale: puoi aggiungere un check reale, ma pnpm db:push di solito riprova 
pnpm drizzle-kit push

echo "Database aggiornato. Avvio del server Hono..."
pnpm run dev