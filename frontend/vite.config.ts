import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Se vuoi rimettere tailwind

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Obbligatorio per Docker
    port: 5173,
    watch: {
      usePolling: true, // Obbligatorio per Arch/Linux
    },
  },
})