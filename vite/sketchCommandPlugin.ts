import path from 'node:path'
import fs from 'node:fs'
import type { Plugin } from 'vite'

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

export function sketchExternals(id: string): boolean {
  if (id === 'sketch' || id.startsWith('sketch/')) return true
  if (CORE_MODULES.includes(id)) return true
  return false
}

export function normalizeScript(script: string): string {
  return script.replace(/\.(?![jt]sx?$)|\//g, '_').replace(/[jt]sx?$/, 'js')
}

interface CommandInfo {
  script: string
  handlers: string[]
}

function getCommandsFromManifest(manifestPath: string): CommandInfo[] {
  const manifestJSON = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  const bucket: Record<string, CommandInfo> = {}

  const pushHandler = (info: CommandInfo, handlers: unknown) => {
    if (typeof handlers === 'string') info.handlers.push(handlers)
    else if (Array.isArray(handlers))
      handlers.forEach((h) => pushHandler(info, h))
    else if (handlers && typeof handlers === 'object')
      Object.values(handlers).forEach((h) => pushHandler(info, h))
  }

  for (const command of manifestJSON.commands as Array<{
    script: string
    handler?: string
    handlers?: unknown
  }>) {
    if (!bucket[command.script])
      bucket[command.script] = { script: command.script, handlers: [] }

    const info = bucket[command.script]
    if (command.handler) pushHandler(info, command.handler)
    if (command.handlers) pushHandler(info, command.handlers)
    if (!info.handlers.includes('onRun')) info.handlers.push('onRun')
  }

  return Object.values(bucket)
}

export function sketchCommandWrapper(
  manifestPath: string,
  outputFileName: string
): Plugin {
  return {
    name: 'sketch-command-wrapper',
    apply: 'build',
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
      if (chunk && chunk.type === 'chunk')
        chunk.code = `${header}\n${chunk.code}\n${footer}`
    },
  }
}

export function webviewHtmlPathPlugin(
  htmlSourcePath: string,
  htmlFileName: string
): Plugin {
  const virtualId = '\0sketch-webview-html-path'
  return {
    name: 'sketch-webview-html-path',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer) return null
      const resolved = path.resolve(path.dirname(importer), source)
      if (resolved === htmlSourcePath) return virtualId
      return null
    },
    load(id) {
      if (id === virtualId)
        return `export default "file://" + String(context.scriptPath).split(".sketchplugin/Contents/Sketch")[0] + ${JSON.stringify(
          `.sketchplugin/Contents/Resources/${htmlFileName}`
        )};`

      return null
    },
  }
}
