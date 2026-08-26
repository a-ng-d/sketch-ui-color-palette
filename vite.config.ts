import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import preact from '@preact/preset-vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import {
  sketchCommandWrapper,
  sketchExternals,
  normalizeScript,
  webviewHtmlPathPlugin,
} from './vite/sketchCommandPlugin'

/**
 * Same dual-build shape as figma-ui-color-palette / penpot-ui-color-palette's
 * vite.config.ts: one file, `IS_PLUGIN` env var picks which of the two
 * targets gets built. Run via:
 *
 *   npx vite build --mode development                    # UI  -> Contents/Resources/resources_webview.js
 *   cross-env IS_PLUGIN=true npx vite build --mode development  # command -> Contents/Sketch/__runUicp.js
 *
 * (see package.json's build:vite / watch:vite scripts, which also run
 * scripts/copy-sketch-bundle.mjs first — the one piece of ceremony Figma
 * and Penpot don't need: skpm's `.sketchplugin` bundle wants manifest.json
 * copied + normalized and assets/webview.html copied alongside the JS,
 * there's no such step for `dist/plugin.js` + `dist/index.html`.)
 *
 * What's genuinely Sketch-only vs. copied straight from Figma/Penpot:
 *  - `target`/`sourcemap`/`minify`/`watch`/`emptyOutDir` shape: copied as-is.
 *  - `isPlugin` picking `lib.formats` + output dir: same idea, different
 *    format (`cjs` here, because Sketch's JSContext needs real
 *    `require('sketch/...')` calls — `iife` can't do that, see
 *    ./vite/sketchCommandPlugin.ts).
 *  - `sketchExternals`, `sketchCommandWrapper`, `webviewHtmlPathPlugin`:
 *    Sketch-only, no Figma/Penpot equivalent (their Canvas side has no
 *    external-module story or handler-binding wrapper to replicate).
 *  - `cssInjectedByJsPlugin`: stands in for Figma/Penpot's
 *    `viteSingleFile()`. They inline everything into one `index.html`;
 *    Sketch's webview loads `webview.html` + a separate
 *    `resources_webview.js` (see resources/webview.html), so only the CSS
 *    needs inlining-into-JS, not the whole HTML.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'
  const isPlugin = process.env.IS_PLUGIN === 'true'

  const bundleDir = path.resolve(
    process.cwd(),
    'sketch-ui-color-palette.sketchplugin'
  )
  const manifestPath = path.resolve(process.cwd(), 'src/manifest.json')
  const commandFileName = normalizeScript('./runUicp.js') // -> '__runUicp.js'

  // Neither Sketch's JSContext nor the webview's WKWebView have a
  // `process` global. global.config.ts reads process.env.NODE_ENV /
  // .npm_package_version directly and is imported by BOTH builds; on top
  // of that, third-party deps bundled into the webview check arbitrary
  // process.env.* keys of their own (found: a CSS-in-JS dependency
  // checking `process.env.LANG` for a locale-specific console warning,
  // completely unrelated to our own code).
  //
  // Enumerating every key some dependency might check is a losing game,
  // so instead of `process.env.SOME_KEY` -> value per key, replace the
  // whole `process.env` *expression* with one literal object. Any key
  // not in it (LANG, whatever else) just reads as `undefined` off a real
  // object instead of throwing "Can't find variable: process" trying to
  // resolve `process` itself. (Confirmed both problems firsthand: this
  // shipped unsubstituted as `pluginVersion: process.env.npm_package_version`
  // when only defined for the command build, and separately as
  // `process.env.LANG && process.env.LANG.startsWith(...)` from a dep
  // this project never touches directly.)
  const processEnv: Record<string, string> = {
    NODE_ENV: mode,
    npm_package_version: process.env.npm_package_version || '0.0.0',
  }
  Object.keys(env)
    .filter((key) => key.startsWith('REACT_APP_'))
    .forEach((key) => {
      processEnv[key] = env[key]
    })

  const define: Record<string, string> = {
    'process.env': JSON.stringify(processEnv),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  }

  return {
    plugins: [
      preact(),
      cssInjectedByJsPlugin(),
      isPlugin &&
        webviewHtmlPathPlugin(
          path.resolve(process.cwd(), 'resources/webview.html'),
          'webview.html'
        ),
      isPlugin && sketchCommandWrapper(manifestPath, commandFileName),
      !isDev &&
        env.SENTRY_AUTH_TOKEN &&
        sentryVitePlugin({
          org: 'yelbolt',
          project: 'ui-color-palette',
          authToken: env.SENTRY_AUTH_TOKEN,
          sourcemaps: {
            assets: `${bundleDir}/Contents/**`,
            filesToDeleteAfterUpload: '**/*.map',
          },
          release: {
            name: env.VITE_APP_VERSION || process.env.npm_package_version,
            setCommits: { auto: true },
            finalize: true,
            deploy: { env: 'production' },
          },
          telemetry: false,
        }),
    ].filter(Boolean),

    define,

    resolve: {
      preserveSymlinks: true,
      alias: {
        '@ui-lib': path.resolve(
          process.cwd(),
          'packages/ui-ui-color-palette/src'
        ),
      },
    },


    optimizeDeps: {
      include: [
        'preact',
        'preact/hooks',
        'preact/compat',
        'preact/jsx-runtime',
        '@unoff/ui',
        '@unoff/utils',
      ],
    },

    build: {
      // Same ceiling ts-loader enforced for Sketch's JSContext today
      // (webpack.skpm.config.js overrides target to es2019 for both
      // command and webview code). Figma/Penpot target es2015; Sketch
      // doesn't need to go that conservative, but keep it as-is for now
      // rather than changing behaviour mid-migration.
      target: 'es2019',
      sourcemap: isDev,
      // esbuild's `format: 'cjs'` transform (which Vite also runs
      // unminified, as part of `target` downleveling) rewrites top-level
      // `this` to `exports` — correct for a real Node CJS module, wrong
      // here, since Sketch's `this` is the real context it inspects for
      // onRun/onShutdown/etc., not our throwaway local `exports` object.
      // Fixed by moving the header/footer injection to `generateBundle`
      // in sketchCommandWrapper, which runs after that transform — so
      // minification is safe again (verified against the built output).
      minify: !isDev,
      watch: isDev ? {} : null,
      emptyOutDir: false,
      ...(isPlugin
        ? {
            outDir: path.join(bundleDir, 'Contents/Sketch'),
            lib: {
              entry: path.resolve(process.cwd(), 'src/runUicp.js'),
              fileName: () => commandFileName,
              formats: ['cjs' as const],
            },
            rollupOptions: {
              external: sketchExternals,
              output: { exports: 'named' as const },
            },
          }
        : {
            outDir: path.join(bundleDir, 'Contents/Resources'),
            lib: {
              // .jsx, not .js: esbuild only parses JSX syntax for
              // .jsx/.tsx files. This file used to be webview.js — every
              // .js/.jsx file went through the same babel+JSX preset
              // under webpack, but esbuild (used by every Vite build
              // stage, including ones that don't consult the top-level
              // `esbuild` config, e.g. the `vite:define` transform) keys
              // JSX support off the extension instead. Renamed rather
              // than worked around.
              entry: path.resolve(process.cwd(), 'resources/webview.jsx'),
              name: 'SketchUicpWebview',
              fileName: () => 'resources_webview.js',
              formats: ['iife' as const],
            },
          }),
    },
  }
})
