import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import {
  Data,
  FullConfiguration,
  ViewConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import scheduleSaveDocument from '../../utils/scheduleSaveDocument'
import { tolgee } from '../../runUicp'
import Documents from '../../canvas/Documents'

const createDocument = async (id: string, view: ViewConfiguration) => {
  const Document = Dom.getSelectedDocument()
  const Page = Document.selectedPage

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []

  const palette = currentPalettes.find((palette) => palette.meta.id === id)

  if (palette === undefined) throw new Error(tolgee.t('error.unfoundPalette'))

  const documents = new Documents({
    base: palette.base,
    themes: palette.themes,
    data: new Data(palette).makePaletteData(),
    meta: palette.meta,
    view: view,
  })

  Page.layers.push(documents.documents)
  documents.documents.layers.forEach(
    (document: any) => (document.selected = true)
  )
  Document.centerOnLayer(documents.documents)
  scheduleSaveDocument(Document)

  return palette
}

export default createDocument
