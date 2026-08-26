import path from 'node:path'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { defineConfig, loadEnv } from 'vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import preact from '@preact/preset-vite'
import {
  sketchCommandWrapper,
  sketchExternals,
  normalizeScript,
  webviewHtmlPathPlugin,
} from './vite/sketchCommandPlugin'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'
  const isPlugin = process.env.IS_PLUGIN === 'true'

  const bundleDir = path.resolve(
    process.cwd(),
    'sketch-ui-color-palette.sketchplugin'
  )
  const manifestPath = path.resolve(process.cwd(), 'src/manifest.json')
  const commandFileName = normalizeScript('./runUicp.js')
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
      target: 'es2019',
      sourcemap: isDev,
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
              entry: path.resolve(process.cwd(), 'resources/webview.jsx'),
              name: 'SketchUicpWebview',
              fileName: () => 'resources_webview.js',
              formats: ['iife' as const],
            },
          }),
    },
  }
})
