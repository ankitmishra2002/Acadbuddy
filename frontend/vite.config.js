import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** API calls use VITE_API_URL from .env (e.g. http://localhost:7000/api). No dev-server proxy — same model as Vercel production. */
export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      port: 3000,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('react-dom') || id.includes('node_modules/react/') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-icons';
          },
        },
      },
      chunkSizeWarningLimit: 900,
    },
  };
});
