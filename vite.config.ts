import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import postcssPresetEnv from "postcss-preset-env";
import Icons from "unplugin-icons/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Icons({
      autoInstall: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "^": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  css: {
    postcss: {
      plugins: [postcssPresetEnv],
    },
    devSourcemap: false,
  },
});
