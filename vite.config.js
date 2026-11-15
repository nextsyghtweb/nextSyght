import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the heavy 3D libraries in their own chunk. The chunk is only
    // downloaded when the 3D scene is actually used (it is lazy-loaded),
    // so visitors on weak devices never pay for it.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/') || id.includes('node_modules/@react-three/')) {
            return 'three';
          }
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase';
          }
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
