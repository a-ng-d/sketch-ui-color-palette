import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { getWebContents } from '../../utils/webContents'
import { SettingsMessage } from '../../types/messages'
import { locales } from '../../../resources/content/locales'

const updateSettings = async (msg: SettingsMessage) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === msg.id)
  const now = new Date().toISOString()

  if (palette === undefined) throw new Error(locales.get().error.fetchPalette)

  const theme = palette.themes.find((theme) => theme.isEnabled)
  if (theme !== undefined) {
    theme.visionSimulationMode = msg.data.visionSimulationMode
    theme.textColorsTheme = msg.data.textColorsTheme
  }

  palette.base.name = msg.data.name
  palette.base.description = msg.data.description
  palette.base.colorSpace = msg.data.colorSpace
  palette.base.algorithmVersion = msg.data.algorithmVersion

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id'],
    palette.libraryData
  )

  palette.meta.dates.updatedAt = now
  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: 'UPDATE_PALETTE_DATE',
      data: now,
    })})`
  )

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id'],
    palette.libraryData
  )

  Settings.setDocumentSettingForKey(
    Document,
    'ui_color_palettes',
    currentPalettes
  )

  return palette
}

export default updateSettings
