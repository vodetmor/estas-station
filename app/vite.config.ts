import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: o app é publicado no GitHub Pages sob /estas-station/, e com './'
  // o mesmo build funciona tanto lá quanto aberto de um diretório local.
  base: './',
  plugins: [react()],
})
