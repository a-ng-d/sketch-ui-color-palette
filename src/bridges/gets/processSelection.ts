import { uid } from 'uid/single'
import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import chroma from 'chroma-js'
import {
  FullConfiguration,
  HexModel,
  SourceColorConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { getWebContents } from '../../utils/webContents'

export let currentSelection: Array<any> = []
export let previousSelection: Array<any> = []
export let isSelectionChanged = false

const processSelection = (webContents?: any) => {
  const Document = Dom.getSelectedDocument()
  const sharedWebContents =
    webContents === undefined ? getWebContents() : webContents

  previousSelection = currentSelection.length === 0 ? [] : currentSelection
  isSelectionChanged = true

  const selection: Array<any> = Document.selectedLayers.layers
  currentSelection = Document.selectedLayers

  const viableSelection: Array<SourceColorConfiguration> = []

  const document = selection[0]

  const selectionHandler = (state: string, data?: any) => {
    const actions: { [key: string]: () => void } = {
      DOCUMENT_SELECTED: async () => {
        const id = Settings.layerSettingForKey(document, 'id')
        const currentPalettes: Array<FullConfiguration> =
          Settings.documentSettingForKey(Document, 'ui_color_palettes')
        const palette = currentPalettes.find(
          (palette) => palette.meta.id === id
        )

        sharedWebContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'DOCUMENT_SELECTED',
            data: {
              view: Settings.layerSettingForKey(document, 'view'),
              id: id,
              updatedAt: Settings.layerSettingForKey(document, 'updatedAt'),
              isLinkedToPalette: palette !== undefined,
            },
          })})`
        )
      },
      EMPTY_SELECTION: () => {
        sharedWebContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'EMPTY_SELECTION',
          })})`
        )
      },
      COLOR_SELECTED: () => {
        sharedWebContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'COLOR_SELECTED',
            data: {
              selection: viableSelection,
            },
          })})`
        )
      },
      IMAGE_SELECTED: () => {
        const uint8Array = new Uint8Array(data.arrayBuffer)
        const arrayData = Array.from(uint8Array)

        sharedWebContents.executeJavaScript(`
          (function() {
            const arrayData = ${JSON.stringify(arrayData)};
            const arrayBuffer = new Uint8Array(arrayData).buffer;
            
            sendData({
              type: 'GET_IMAGE_HASH',
              data: {
                arrayBuffer: arrayBuffer,
                imageTitle: '${data.element.name || 'Selected Image'}'
              }
            });
          })();
        `)
      },
    }

    return actions[state]?.()
  }

  if (
    selection.length === 1 &&
    Settings.layerSettingForKey(document, 'type') === 'UI_COLOR_PALETTE' &&
    (document.type !== 'SymbolMaster' || document.type !== 'SymbolInstance')
  )
    return selectionHandler('DOCUMENT_SELECTED')
  else if (selection.length === 0) selectionHandler('EMPTY_SELECTION')

  selection.forEach((element) => {
    const foundColors = element.style.fills.filter(
      (fill: any) => fill.fillType === 'Color'
    )
    if (
      element.type !== 'Group' &&
      element.type !== 'SymbolMaster' &&
      element.type !== 'SymbolInstance' &&
      element.type !== 'Text' &&
      foundColors.length > 0
    ) {
      foundColors.forEach((color: any) => {
        const hexToGl = chroma(color.color as HexModel).gl()
        viableSelection.push({
          name: element.name,
          rgb: {
            r: hexToGl[0],
            g: hexToGl[1],
            b: hexToGl[2],
          },
          source: 'CANVAS',
          id: uid(),
          isRemovable: false,
          hue: {
            shift: 0,
            isLocked: false,
          },
          chroma: {
            shift: 100,
            isLocked: false,
          },
        })
      })
      return selectionHandler('COLOR_SELECTED')
    }

    if (element.type === 'Image')
      try {
        const base64Data = element.image?.base64

        if (base64Data && base64Data.length > 0) {
          let arrayBuffer: ArrayBuffer

          try {
            if (typeof Buffer !== 'undefined') {
              const buffer = Buffer.from(base64Data, 'base64')
              arrayBuffer = buffer.buffer.slice(
                buffer.byteOffset,
                buffer.byteOffset + buffer.byteLength
              )
            } else {
              const chars =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
              const cleanBase64 = base64Data.replace(/[^A-Za-z0-9+/]/g, '')
              const byteArray = []

              for (let i = 0; i < cleanBase64.length; i += 4) {
                const a = chars.indexOf(cleanBase64[i] || 'A')
                const b = chars.indexOf(cleanBase64[i + 1] || 'A')
                const c = chars.indexOf(cleanBase64[i + 2] || 'A')
                const d = chars.indexOf(cleanBase64[i + 3] || 'A')

                const bitmap = (a << 18) | (b << 12) | (c << 6) | d

                byteArray.push((bitmap >> 16) & 255)
                if (cleanBase64[i + 2] !== '=')
                  byteArray.push((bitmap >> 8) & 255)
                if (cleanBase64[i + 3] !== '=') byteArray.push(bitmap & 255)
              }

              arrayBuffer = new Uint8Array(byteArray).buffer
            }

            if (arrayBuffer.byteLength > 0)
              return selectionHandler('IMAGE_SELECTED', {
                arrayBuffer,
                element,
              })
          } catch (error) {
            sharedWebContents.executeJavaScript(
              `sendData(${JSON.stringify({
                type: 'REPORT_ERROR',
                data: error,
              })})`
            )
          }
        }
      } catch (error) {
        sharedWebContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'REPORT_ERROR',
            data: error,
          })})`
        )
      }
  })

  setTimeout(() => (isSelectionChanged = false), 1000)
}

export default processSelection
