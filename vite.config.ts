
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    compression({ algorithm: 'gzip' }), // Add gzip compression
    compression({ algorithm: 'brotliCompress', ext: '.br' }), // Add Brotli compression
    visualizer({
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false // Set to true to open stats after build
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-switch', '@radix-ui/react-slider', '@radix-ui/react-select'],
          'chart-vendor': ['recharts'],
          'motion-vendor': ['framer-motion'],
        }
      }
    },
    target: 'esnext'
  }
}));
