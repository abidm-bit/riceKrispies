import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
        '/users/register/': 'http://localhost:8080/users/register/',
        '/users/login/': 'http://localhost:8080/users/login/',
        '/fetchKeys': 'http://localhost:8080/fetchKeys',
    }
  }
})
