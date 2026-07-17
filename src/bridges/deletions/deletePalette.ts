import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import { tolgee } from '../../runUicp'

const deletePalette = async (id: string) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === id)

  if (palette === undefined) throw new Error(tolgee.t('error.unfoundPalette'))

  Settings.setDocumentSettingForKey(
    Document,
    'ui_color_palettes',
    currentPalettes.filter((palette) => palette.meta.id !== id)
  )

  Document.save()

  return palette
}

export default deletePalette
