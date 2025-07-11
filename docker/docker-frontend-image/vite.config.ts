import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@models": path.resolve(__dirname, "src/models"),
        "@services": path.resolve(__dirname, "src/services"),
        "@router": path.resolve(__dirname, "src/router"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@components": path.resolve(__dirname, "src/components"),
        "@config": path.resolve(__dirname, "src/config.ts")
      }
    },
    server: {
      port: 5173
    }
  };
});
