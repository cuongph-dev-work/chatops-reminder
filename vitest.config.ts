// Vitest configuration
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true
  },
  resolve: {
    alias: {
      "~shared": path.resolve(__dirname, "./src/shared"),
      "~background": path.resolve(__dirname, "./src/background"),
      "~popup": path.resolve(__dirname, "./src/popup"),
      "~contents": path.resolve(__dirname, "./src/contents")
    }
  }
})
