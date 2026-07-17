import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import { getWebContents } from '../../utils/webContents'
import { tolgee } from '../../runUicp'

const jumpToPalette = async (id: string) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === id)

  if (palette === undefined) throw new Error(tolgee.t('error.fetchPalette'))

  palette.meta.dates.openedAt = new Date().toISOString()
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

  return palette
}

export default jumpToPalette
