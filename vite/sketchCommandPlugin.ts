import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * Node core modules that Sketch's JSContext ships natively, exactly like
 * skpm-build's webpackConfig.js CORE_MODULES list. These must stay as
 * `require(...)` calls rather than being bundled.
 */
const CORE_MODULES = [
  'buffer',
  'console',
  'events',
  'os',
  'path',
  'process',
  'querystring',
  'stream',
  'string_decoder',
  'timers',
  'util',
]

/**
 * Equivalent of skpm-build's `externals` function: `sketch` and any
 * `sketch/*` module (sketch/dom, sketch/ui, sketch/settings, ...) are
 * provided natively by Sketch's plugin runtime and must be left as
 * `require(...)` calls in the CJS output, never bundled.
 *
 * NOTE: this only matches literal `sketch` / `sketch/...` — packages like
 * `sketch-module-web-view` do NOT match and get bundled normally, same as
 * today.
 */
export function sketchExternals(id: string): boolean {
  if (id === 'sketch' || id.startsWith('sketch/')) return true
  if (CORE_MODULES.includes(id)) return true
  return false
}

/** Mirrors skpm-build's `entry.script.replace(...)` filename normalization. */
export function normalizeScript(script: string): string {
  return script.replace(/\.(?![jt]sx?$)|\//g, '_').replace(/[jt]sx?$/, 'js')
}

interface CommandInfo {
  script: string
  handlers: string[]
}

/**
 * Re-derives, from src/manifest.json, which handler names each command
 * script must expose — same logic as skpm-build's `getCommands` in build.js.
 */
function getCommandsFromManifest(manifestPath: string): CommandInfo[] {
  const manifestJSON = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  const bucket: Record<string, CommandInfo> = {}

  const pushHandler = (info: CommandInfo, handlers: unknown) => {
    if (typeof handlers === 'string') {
      info.handlers.push(handlers)
    } else if (Array.isArray(handlers)) {
      handlers.forEach((h) => pushHandler(info, h))
    } else if (handlers && typeof handlers === 'object') {
      Object.values(handlers).forEach((h) => pushHandler(info, h))
    }
  }

  for (const command of manifestJSON.commands as Array<{
    script: string
    handler?: string
    handlers?: unknown
  }>) {
    if (!bucket[command.script]) {
      bucket[command.script] = { script: command.script, handlers: [] }
    }
    const info = bucket[command.script]
    if (command.handler) pushHandler(info, command.handler)
    if (command.handlers) pushHandler(info, command.handlers)
    // skpm-build always exposes the default export as `onRun`
    if (!info.handlers.includes('onRun')) info.handlers.push('onRun')
  }

  return Object.values(bucket)
}

/**
 * Rollup `renderChunk` equivalent of skpm-build's
 * `webpackHeaderFooterPlugin.js`. Sketch's JSContext evaluates each command
 * script with a meaningful `this` and no ambient `require`/`exports`
 * wiring of its own for *our* bundle output, so we:
 *
 *  1. declare `var exports = {}` ourselves (webpack got this for free from
 *     `output.library = 'exports'`; Rollup's plain `cjs` format assumes the
 *     caller already provides `exports`, so we provide it),
 *  2. wrap the whole bundle body in `__skpm_run`, exactly like the
 *     original, so it re-evaluates fresh on every invocation,
 *  3. bind every handler name declared in manifest.json onto `globalThis`
 *     (aliased to `this`), which is what Sketch actually inspects.
 *
 * IMPORTANT: verify the emitted file against a known-good skpm-build output
 * once before shipping — this is a faithful port, not a guess, but it has
 * not been run inside Sketch yet.
 */
export function sketchCommandWrapper(
  manifestPath: string,
  outputFileName: string
): Plugin {
  return {
    name: 'sketch-command-wrapper',
    apply: 'build',
    // NOT renderChunk: esbuild's `format: 'cjs'` transform — which Vite
    // runs on the chunk as part of `build.target` downleveling, even
    // unminified — rewrites any top-level `this` to `exports` (correct
    // for a *real* Node CJS module, where they're the same value; wrong
    // here, since Sketch's `this` is not our throwaway `exports` object).
    // Confirmed by isolated test: `esbuild.transform(code, {format:'cjs'})`
    // alone reproduces it, independent of minify/target. That transform
    // runs during `renderChunk`, so injecting our header/footer at that
    // same stage means our own literal `this` gets corrupted right along
    // with it. `generateBundle` runs after all `renderChunk` hooks across
    // every plugin (Rollup hook ordering), so patching `bundle[...].code`
    // here appends our header/footer *after* esbuild has already run.
    generateBundle(_options, bundle) {
      const commands = getCommandsFromManifest(manifestPath)
      const command = commands.find(
        (c) => normalizeScript(c.script) === outputFileName
      )
      const handlers = command?.handlers ?? ['onRun']

      const header = `var exports = {};
var globalThis = this;
var global = this;
function __skpm_run(key, context) {
  globalThis.context = context;
  try {
`
      const footer = `    if (key === 'default' && typeof exports === 'function') {
      exports(context);
    } else if (typeof exports[key] !== 'function') {
      throw new Error('Missing export named "' + key + '". Your command should contain something like \`export function ' + key + '() {}\`.');
    } else {
      exports[key](context);
    }
  } catch (err) {
    if (typeof process !== 'undefined' && process.listenerCount && process.listenerCount('uncaughtException')) {
      process.emit('uncaughtException', err, 'uncaughtException');
    } else {
      throw err;
    }
  }
}
${handlers
  .map((k) =>
    k === 'onRun' || k === 'run'
      ? `globalThis['${k}'] = __skpm_run.bind(this, 'default')`
      : `globalThis['${k}'] = __skpm_run.bind(this, '${k}')`
  )
  .join(';\n')}
`

      const chunk = bundle[outputFileName]
      if (chunk && chunk.type === 'chunk') {
        chunk.code = `${header}\n${chunk.code}\n${footer}`
      }
    },
  }
}

/**
 * Replaces `import webviewHtmlUrl from '../resources/webview.html'` with
 * the value Sketch actually needs at runtime for
 * `browserWindow.loadURL(...)`.
 *
 * Checked against the currently-built `__runUicp.js` in the repo: skpm
 * does NOT emit a static relative path here. It emits
 *
 *   module.exports = "file://" + String(context.scriptPath)
 *     .split(".sketchplugin/Contents/Sketch")[0]
 *     + ".sketchplugin/Contents/Resources/_webpack_resources/<hash>.html";
 *
 * i.e. an absolute `file://` URL derived at runtime from
 * `context.scriptPath` (the path Sketch hands the command on every
 * invocation), so the plugin works regardless of where the user's
 * `.sketchplugin` bundle is actually installed. `context` is safe to
 * reference here as a bare identifier because this statement ends up
 * nested inside `__skpm_run(key, context) { ... }` (see
 * sketchCommandWrapper above) — same reason the original works.
 *
 * `htmlFileName` should match whatever the orchestrator script copies
 * webview.html to in Contents/Resources (currently a plain
 * `webview.html`, not a content-hashed name — the hash was webpack's own
 * asset-collision avoidance, not something Sketch requires).
 */
export function webviewHtmlPathPlugin(
  htmlSourcePath: string,
  htmlFileName: string
): Plugin {
  const virtualId = '\0sketch-webview-html-path'
  return {
    name: 'sketch-webview-html-path',
    // Must win over Vite's own core HTML-handling plugin, which otherwise
    // grabs any `.html` import first, tries to treat it as an HTML entry
    // (warns about the non-module <script src> inside), and resolves it
    // to a module with no `default` export.
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer) return null
      const resolved = path.resolve(path.dirname(importer), source)
      if (resolved === htmlSourcePath) return virtualId
      return null
    },
    load(id) {
      if (id === virtualId) {
        return `export default "file://" + String(context.scriptPath).split(".sketchplugin/Contents/Sketch")[0] + ${JSON.stringify(
          `.sketchplugin/Contents/Resources/${htmlFileName}`
        )};`
      }
      return null
    },
  }
}
