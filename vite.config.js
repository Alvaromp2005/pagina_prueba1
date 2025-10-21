import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.APP_PORT) || parseInt(env.VITE_APP_PORT) || 8000,
      host: true,
    },
    build: {
      outDir: 'dist',
    },
    publicDir: 'public',
  };
});
