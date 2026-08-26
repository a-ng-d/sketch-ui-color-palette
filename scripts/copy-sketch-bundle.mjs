#!/usr/bin/env node
/**
 * The one piece of ceremony Figma/Penpot's build doesn't need: skpm's
 * `.sketchplugin` bundle wants manifest.json copied (with normalized
 * command script filenames) and assets/webview.html copied alongside the
 * JS. Figma just ships manifest.json + dist/plugin.js + dist/index.html
 * untouched — no copy step at all.
 *
 * Run this once before the two `vite build` invocations (see
 * package.json's build:vite / watch:vite). It does not call Vite at all;
 * vite.config.ts (IS_PLUGIN switch) handles both actual builds.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const bundlePath = path.join(root, 'sketch-ui-color-palette.sketchplugin')
const sketchDir = path.join(bundlePath, 'Contents', 'Sketch')
const resourcesDir = path.join(bundlePath, 'Contents', 'Resources')

/** Mirrors skpm-build's `entry.script.replace(...)` filename normalization. */
function normalizeScript(script) {
  return script.replace(/\.(?![jt]sx?$)|\//g, '_').replace(/[jt]sx?$/, 'js')
}

fs.mkdirSync(sketchDir, { recursive: true })
fs.mkdirSync(resourcesDir, { recursive: true })

// manifest.json, with command script paths normalized the same way
// vite.config.ts's `commandFileName` computes its output filename.
const manifestJSON = JSON.parse(
  fs.readFileSync(path.join(root, 'src/manifest.json'), 'utf-8')
)
fs.writeFileSync(
  path.join(sketchDir, 'manifest.json'),
  JSON.stringify(
    {
      ...manifestJSON,
      // skpm-build's copyManifest() defaults this to true when the
      // source manifest doesn't set it. Missing this default leaves
      // Sketch's CocoaScript preprocessor ON, which rewrites bracket
      // syntax it thinks looks like Objective-C messages — it will
      // misfire on ordinary JS in the bundle (sketch-module-web-view's
      // ObjC-selector-style string keys, e.g.
      // "webView:didFinishNavigation:", look exactly like what it's
      // hunting for) and produce cascading syntax errors at runtime
      // with no build-time warning. Confirmed as the cause of:
      // "SyntaxError: Unexpected token ';'. Expected ')' to end an
      // argument list." when this field was left unset.
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

// assets/** -> Contents/Resources
const assetsSrc = path.join(root, 'assets')
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, resourcesDir, { recursive: true, force: true })
  console.log('🖨  assets/')
}

// static HTML shell -> Contents/Resources (vite.config.ts's
// webviewHtmlPathPlugin points the command bundle at this exact filename)
fs.copyFileSync(
  path.join(root, 'resources/webview.html'),
  path.join(resourcesDir, 'webview.html')
)
console.log('🖨  resources/webview.html')

// Touch the two build outputs if they don't exist yet (fresh clone: no
// .sketchplugin built at all). start:dev runs `hotreload` (entr, watching
// these two files) in parallel with the vite watchers — entr needs the
// files to already exist the moment it starts, and the first real vite
// build hasn't necessarily finished yet by then.
for (const file of [
  path.join(sketchDir, '__runUicp.js'),
  path.join(resourcesDir, 'resources_webview.js'),
]) {
  if (!fs.existsSync(file)) fs.closeSync(fs.openSync(file, 'w'))
}
