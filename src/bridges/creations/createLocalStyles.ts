import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { tolgee } from '../../runUicp'
import LocalStyle from '../../canvas/LocalStyle'

const createLocalStyles = async (id: string) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === id)

  if (palette === undefined) throw new Error(tolgee.t('error.unfoundPalette'))

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id', 'hex'],
    palette.libraryData
  )

  const hasThemes = palette.libraryData.some(
    (item) => !item.id.includes('00000000000')
  )

  const createdLocalStylesStatusMessage = await Promise.all(
    Document.sharedLayerStyles
  ).then((localStyles) => {
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
          localStyles.find(
            (localStyle: any) => localStyle.id === item.styleId
          ) === undefined &&
          item.hex !== undefined
        ) {
          const style = new LocalStyle({
            name: path,
            hex: item.hex,
          })

          item.styleId = style.sharedColorStyle.id
          i++
        }

        return item
      })

    palette.libraryData = new Data(palette).makeLibraryData(
      ['style_id'],
      palette.libraryData
    )

    Settings.setDocumentSettingForKey(
      Document,
      'ui_color_palettes',
      currentPalettes
    )

    Document.save()

    return tolgee.t('info.createdLocalStyles', { count: i })
  })

  return createdLocalStylesStatusMessage
}

export default createLocalStyles
