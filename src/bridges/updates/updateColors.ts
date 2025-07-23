import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { getWebContents } from '../../utils/webContents'
import { ColorsMessage } from '../../types/messages'
import { locales } from '../../../resources/content/locales'

const updateColors = async (msg: ColorsMessage) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === msg.id)
  const now = new Date().toISOString()

  if (palette === undefined) throw new Error(locales.get().error.fetchPalette)

  palette.base.colors = msg.data

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

export default updateColors
