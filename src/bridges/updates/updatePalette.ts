import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { Data, FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import { getWebContents } from '../../utils/webContents'
import scheduleSaveDocument from '../../utils/scheduleSaveDocument'
import { PaletteMessage } from '../../types/messages'
import { tolgee } from '../../runUicp'

const updatePalette = async ({
  msg,
  isAlreadyUpdated = false,
  shouldLoadPalette = true,
}: {
  msg: PaletteMessage
  isAlreadyUpdated?: boolean
  shouldLoadPalette?: boolean
}) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === msg.id)
  const now = new Date().toISOString()

  if (palette === undefined) throw new Error(tolgee.t('error.unfoundPalette'))

  msg.items.forEach((item) => {
    const pathParts = item.key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: Record<string, any> = palette

    for (let i = 0; i < pathParts.length - 1; i++) {
      if (current[pathParts[i]] === undefined) current[pathParts[i]] = {}
      current = current[pathParts[i]]
    }

    current[pathParts[pathParts.length - 1]] = item.value
  })

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id'],
    palette.libraryData
  )

  if (!isAlreadyUpdated) {
    palette.meta.dates.updatedAt = now
    getWebContents().executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'UPDATE_PALETTE_DATE',
        data: now,
      })})`
    )
  }

  if (shouldLoadPalette)
    getWebContents().executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'LOAD_PALETTE',
        data: palette,
      })})`
    )

  Settings.setDocumentSettingForKey(
    Document,
    'ui_color_palettes',
    currentPalettes
  )

  scheduleSaveDocument(Document)

  return palette
}

export default updatePalette
