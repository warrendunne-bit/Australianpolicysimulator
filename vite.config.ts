import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.VERCEL ? '/' : '/Australianpolicysimulator/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
