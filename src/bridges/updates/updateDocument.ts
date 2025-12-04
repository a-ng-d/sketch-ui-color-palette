import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import {
  Data,
  FullConfiguration,
  PaletteDataThemeItem,
  ThemeConfiguration,
  ViewConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { getWebContents } from '../../utils/webContents'
import setPaletteName from '../../utils/setPaletteName'
import { tolgee } from '../../runUicp'
import Sheet from '../../canvas/Sheet'
import Palette from '../../canvas/Palette'

const updateDocument = async (view: ViewConfiguration) => {
  const Document = Dom.getSelectedDocument()
  const document = Document.selectedLayers.layers[0]

  const id = Settings.layerSettingForKey(document, 'id')
  const themeId = Settings.layerSettingForKey(document, 'themeId')

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === id)

  if (palette === undefined) throw new Error(tolgee.t('error.unfoundPalette'))

  const themeData = new Data(palette)
    .makePaletteData()
    .themes.find((theme: PaletteDataThemeItem) => theme.id === themeId)
  const currentTheme = palette.themes.find(
    (theme: ThemeConfiguration) => theme.id === themeId
  )

  if (themeData === undefined || currentTheme === undefined)
    throw new Error(tolgee.t('error.document'))

  const newDocument =
    view === 'PALETTE_WITH_PROPERTIES' || view === 'PALETTE'
      ? new Palette({
          base: palette.base,
          theme: currentTheme,
          data: themeData,
          meta: palette.meta,
          view: view,
        }).node
      : new Sheet({
          base: palette.base,
          theme: currentTheme,
          data: themeData,
          meta: palette.meta,
          view: view,
        }).node

  document.layers[0].remove()
  document.layers.push(newDocument)
  document.style.fills = [
    {
      color: currentTheme.paletteBackground,
    },
  ]
  document.name = setPaletteName(
    palette.base.name,
    currentTheme.name,
    palette.base.preset.name,
    palette.base.colorSpace,
    currentTheme.visionSimulationMode
  )

  // Update
  Settings.setLayerSettingForKey(document, 'view', view)
  Settings.setLayerSettingForKey(
    document,
    'updatedAt',
    palette.meta.dates.updatedAt.toString()
  )
  Settings.setLayerSettingForKey(document, 'backup', JSON.stringify(palette))

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: 'DOCUMENT_SELECTED',
      data: {
        view: view,
        id: id,
        updatedAt: palette.meta.dates.updatedAt.toString(),
        isLinkedToPalette: true,
      },
    })})`
  )

  Document.save()

  return palette
}

export default updateDocument
