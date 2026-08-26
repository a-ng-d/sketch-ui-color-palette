import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import isValidPaletteConfiguration from '../utils/isValidPaletteConfiguration'
import { getWebContents } from '../../utils/webContents'
import setFilePaletteMigration from '../../utils/setFilePaletteMigration'

const getPalettesOnCurrentFile = async (webContents?: any) => {
  setFilePaletteMigration()

  const Document = Dom.getSelectedDocument()
  const sharedWebContents =
    webContents === undefined ? getWebContents() : webContents

  const rawPalettesList: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []

  const palettesList: Array<FullConfiguration> = rawPalettesList.filter(
    (palette): palette is FullConfiguration =>
      isValidPaletteConfiguration(palette)
  )

  sharedWebContents.executeJavaScript(
    `sendData(${JSON.stringify({
      type: 'EXPOSE_PALETTES',
      data: palettesList,
    })})`
  )

  return palettesList
}

export default getPalettesOnCurrentFile
