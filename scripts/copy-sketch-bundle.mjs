import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const bundlePath = path.join(root, 'sketch-ui-color-palette.sketchplugin')
const sketchDir = path.join(bundlePath, 'Contents', 'Sketch')
const resourcesDir = path.join(bundlePath, 'Contents', 'Resources')

function normalizeScript(script) {
  return script.replace(/\.(?![jt]sx?$)|\//g, '_').replace(/[jt]sx?$/, 'js')
}

fs.mkdirSync(sketchDir, { recursive: true })
fs.mkdirSync(resourcesDir, { recursive: true })

const manifestJSON = JSON.parse(
  fs.readFileSync(path.join(root, 'src/manifest.json'), 'utf-8')
)
fs.writeFileSync(
  path.join(sketchDir, 'manifest.json'),
  JSON.stringify(
    {
      ...manifestJSON,
      disableCocoaScriptPreprocessor:
        typeof manifestJSON.disableCocoaScriptPreprocessor === 'undefined'
          ? true
          : manifestJSON.disableCocoaScriptPreprocessor,
      commands: manifestJSON.commands.map((command) => ({
        ...command,
        script: normalizeScript(command.script),
      })),
    },
    null,
    2
  )
)
console.log('🖨  manifest.json')

const assetsSrc = path.join(root, 'assets')
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, resourcesDir, { recursive: true, force: true })
  console.log('🖨  assets/')
}

fs.copyFileSync(
  path.join(root, 'resources/webview.html'),
  path.join(resourcesDir, 'webview.html')
)
console.log('🖨  resources/webview.html')

for (const file of [
  path.join(sketchDir, '__runUicp.js'),
  path.join(resourcesDir, 'resources_webview.js'),
])
  if (!fs.existsSync(file)) fs.closeSync(fs.openSync(file, 'w'))
