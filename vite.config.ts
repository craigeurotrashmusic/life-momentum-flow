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
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          'radix-ui': [ // Consolidating Radix UI, can be split further if needed
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          'recharts-vendor': ['recharts'], // Renamed for clarity
          'framer-motion-vendor': ['framer-motion'], // Renamed for clarity
          'lucide-icons': ['lucide-react'],
          'supabase-client': ['@supabase/supabase-js'],
          'forms-lib': ['react-hook-form', '@hookform/resolvers'],
          'date-fns-lib': ['date-fns'],
          'embla-carousel': ['embla-carousel-react'],
          // other large libraries can be added here
        }
      }
    },
    target: 'esnext'
  }
}));
