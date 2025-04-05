import { build } from "esbuild";
import { copy } from "esbuild-plugin-copy";
import * as fs from "fs";
// const fs = require("fs");

const envFilePath = "./src/env.ts";

if (fs.existsSync(envFilePath)) {
  (async () => {
    const res = await build({
      entryPoints: ["src/main.ts"],
      bundle: true,
      outfile: "dist/crypto-rsi-analyzer.js",
      platform: "node", // or 'browser' depending on your target
      format: "cjs", // or 'esm'
      sourcemap: false,
      minify: true,
      tsconfig: "./tsconfig.json",
      plugins: [
        copy({
          resolveFrom: "cwd",
          assets: {
            from: ["src/chart.html"],
            to: ["dist/chart.html"],
          },
          watch: true,
        }),
      ],
    });
  })();

  // esbuild
  //   .build({
  //     entryPoints: ["src/main.ts"],
  //     bundle: true,
  //     outfile: "dist/crypto-rsi-analyzer.js",
  //     platform: "node", // or 'browser' depending on your target
  //     format: "cjs", // or 'esm'
  //     sourcemap: false,
  //     minify: true,
  //     tsconfig: "./tsconfig.json",
  //     plugins: [
  //       copy({
  //         resolveFrom: "cwd",
  //         assets: {
  //           from: ["src/chart.html"],
  //           to: ["dist/chart.html"],
  //         },
  //         watch: true,
  //       }),
  //     ],
  //   })
  //   .catch(() => process.exit(1));
} else {
  console.error(">>>>>>> [BUILD ERROR] env file not found");
  console.info(
    '>>>>>>> rename the "env.backup.ts" to "env.ts" and fill with your own values.\n'
  );
}
