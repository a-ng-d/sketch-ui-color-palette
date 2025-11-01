import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { locales } from '@ui-lib/content/locales'
import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import processSelection from '../gets/processSelection'
import { getWebContents } from '../../utils/webContents'

const createPaletteFromDocument = async () => {
  const Document = Dom.getSelectedDocument()
  const document = Document.selectedLayers.layers[0]
  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []

  const palette = Settings.layerSettingForKey(document, 'backup')

  if (palette === undefined) throw new Error(locales.get().error.unfoundPalette)

  const backup = palette as FullConfiguration

  currentPalettes.push(palette)
  Settings.setDocumentSettingForKey(
    Document,
    'ui_color_palettes',
    currentPalettes
  )

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: 'LOAD_PALETTE',
      data: palette,
    })})`
  )

  processSelection()

  Document.save()

  return backup
}

export default createPaletteFromDocument
