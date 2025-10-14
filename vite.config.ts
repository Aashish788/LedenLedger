import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // Security headers for development
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    }
  },
  build: {
    // Security optimizations for production build
    sourcemap: mode === "development",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: true,
        pure_funcs: mode === "production" ? ["console.log", "console.debug"] : []
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        // Code splitting for better performance
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["lucide-react", "@radix-ui/react-dialog"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          supabase: ["@supabase/supabase-js"],
          utils: ["date-fns", "clsx", "tailwind-merge"]
        }
      }
    },
    // Asset optimization
    assetsDir: "assets",
    chunkSizeWarningLimit: 1000
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Environment variable validation
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "zod",
      "dompurify"
    ]
  }
}));
