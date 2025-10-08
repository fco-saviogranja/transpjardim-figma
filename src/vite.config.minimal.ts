import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração absolutamente minimal para debug
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})