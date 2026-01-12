import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { tolgee } from '../../runUicp'
import LocalVariable from '../../canvas/LocalVariable'

const createLocalVariables = async (id: string) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === id)

  if (palette === undefined) throw new Error(tolgee.t('error.unfoundPalette'))

  palette.libraryData = new Data(palette).makeLibraryData(
    ['hex'],
    palette.libraryData
  )

  const hasThemes = palette.libraryData.some(
    (item) => !item.id.includes('00000000000')
  )

  const createdLocalVariablesStatusMessage = await Promise.all(
    Document.swatches
  ).then((localVariables) => {
    let i = 0

    palette.libraryData
      .filter((item) => {
        return hasThemes
          ? !item.id.includes('00000000000')
          : item.id.includes('00000000000')
      })
      .forEach((item) => {
        const path = [
          item.paletteName,
          ...(item.id.includes('00000000000')
            ? []
            : [
                item.themeName === ''
                  ? tolgee.t('themes.defaultName')
                  : item.themeName,
              ]),
          item.colorName === '' ? tolgee.t('defaultColorName') : item.colorName,
          item.shadeName,
        ]
          .filter((item) => item !== '')
          .join('/')

        if (
          localVariables.find(
            (localVariable: any) => localVariable.name === path
          ) === undefined &&
          item.hex !== undefined
        ) {
          new LocalVariable({
            name: path,
            hex: item.hex,
          })

          i++
        }

        return item
      })

    palette.libraryData = new Data(palette).makeLibraryData(
      [],
      palette.libraryData
    )

    Settings.setDocumentSettingForKey(
      Document,
      'ui_color_palettes',
      currentPalettes
    )

    Document.save()

    return tolgee.t('info.createdLocalVariables', { count: i })
  })

  return createdLocalVariablesStatusMessage
}

export default createLocalVariables
