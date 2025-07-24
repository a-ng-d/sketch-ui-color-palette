import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { getWebContents } from '../utils/webContents'

const getPalettesOnCurrentFile = async (webContents?: any) => {
  const Document = Dom.getSelectedDocument()
  const sharedWebContents =
    webContents === undefined ? getWebContents() : webContents

  const palettesList: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []

  sharedWebContents.executeJavaScript(
    `sendData(${JSON.stringify({
      type: 'EXPOSE_PALETTES',
      data: palettesList,
    })})`
  )

  return palettesList
}

export default getPalettesOnCurrentFile
