import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

declare const process: {
  env: Record<string, string | undefined>;
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        hmr: false,
      },
    }),
  ],
  base: "/grindfesta/",
  define: {
    __BUILD_TIME__: JSON.stringify(
      new Date(Date.now() + 9 * 60 * 60 * 1000)
        .toISOString()
        .replace("Z", "+09:00")
    ),
    __COMMIT_TITLE__: JSON.stringify(
      process.env["COMMIT_TITLE"] ?? "No commit title"
    ),
  },
});
