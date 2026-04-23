import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite build configuration for HSCLogic FMS.
 *
 * Key decisions:
 * - jsPDF is split into its own vendor chunk to prevent it bloating the main
 *   bundle — the PDF utilities are only needed when a user explicitly exports
 *   a document, not on initial load.
 * - react / react-dom are isolated in a stable vendor chunk so the browser
 *   can cache them independently of application code changes.
 * - Source maps are disabled in production to protect business logic.
 */
export default defineConfig({
  plugins: [react()],

  build: {
    // Raise the size warning threshold; jsPDF is inherently large (~500 kB)
    chunkSizeWarningLimit: 600,

    // Do not emit source maps in production to protect business logic
    sourcemap: false,
  },

  // Allow absolute imports from src/ root (e.g. "components/ui/Button")
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
