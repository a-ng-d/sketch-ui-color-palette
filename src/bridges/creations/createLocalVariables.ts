import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import LocalVariable from '../../canvas/LocalVariable'
import { locales } from '../../../resources/content/locales'

const createLocalVariables = async (id: string) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === id)

  if (palette === undefined) throw new Error(locales.get().error.unfoundPalette)

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
          item.themeName === ''
            ? locales.get().themes.defaultName
            : item.themeName,
          item.colorName === ''
            ? locales.get().colors.defaultName
            : item.colorName,
          item.shadeName,
        ]
          .filter((item) => item !== '' && item !== 'None')
          .join('/')

        if (
          localVariables.find(
            (localVariable: any) => localVariable.name === path
          ) === undefined &&
          item.hex !== undefined
        ) {
          const variable = new LocalVariable({
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

    if (i > 1)
      return locales
        .get()
        .info.createdLocalVariables.plural.replace('{count}', i.toString())
    else if (i === 1) return locales.get().info.createdLocalVariables.single
    else return locales.get().info.createdLocalVariables.none
  })

  return createdLocalVariablesStatusMessage
}

export default createLocalVariables
