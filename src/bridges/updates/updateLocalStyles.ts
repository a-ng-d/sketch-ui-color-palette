import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../../resources/content/locales'

const updateLocalStyles = async (id: string) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === id)

  if (palette === undefined) throw new Error(locales.get().error.unfoundPalette)

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id', 'hex'],
    palette.libraryData
  )

  const canDeepSyncStyles = Settings.settingForKey('can_deep_sync_styles')
  const hasThemes = palette.libraryData.some(
    (item) => !item.id.includes('00000000000')
  )

  const updatedLocalStylesStatusMessage = await Promise.all(
    Document.sharedLayerStyles
  ).then((localStyles) => {
    let i = 0,
      j = 0,
      k = 0
    const messages: Array<string> = []

    if (canDeepSyncStyles ?? false) {
      const idsToRemove: Array<string> = []
      localStyles.forEach((localStyle: any) => {
        const hasStyleMatch = palette.libraryData.some(
          (libraryItem) => libraryItem.styleId === localStyle.id
        )

        if (!hasStyleMatch) {
          idsToRemove.push(localStyle.id)
          k++
        }
      })
      if (idsToRemove.length > 0)
        idsToRemove.forEach((id) => {
          const index = localStyles.findIndex((v: any) => v.id === id)
          if (index !== -1) {
            localStyles.splice(index, 1)
            Document.sharedLayerStyles.splice(index, 1)
          }
        })
    }

    palette.libraryData
      .filter((item) => {
        return hasThemes
          ? !item.id.includes('00000000000')
          : item.id.includes('00000000000')
      })
      .forEach((item) => {
        const styleMatch = localStyles.find(
          (localStyle: any) => localStyle.id === item.styleId
        )
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
        const hex = item.hex?.length === 7 ? item.hex + 'ff' : item.hex

        if (styleMatch !== undefined) {
          if (styleMatch.name !== path) {
            styleMatch.name = path
            j++
          }

          if (styleMatch.style.fills[0].color !== hex) {
            styleMatch.style.fills[0].color = hex
            j++
          }

          j > 0 ? i++ : i
          j = 0
        }
      })

    if (i > 1)
      messages.push(
        locales
          .get()
          .info.updatedLocalStyles.plural.replace('{count}', i.toString())
      )
    else if (i === 1)
      messages.push(locales.get().info.updatedLocalStyles.single)
    else messages.push(locales.get().info.updatedLocalStyles.none)

    if (k > 1)
      messages.push(
        locales
          .get()
          .info.removedLocalStyles.plural.replace('{count}', k.toString())
      )
    else if (k === 1)
      messages.push(locales.get().info.removedLocalStyles.single)
    else messages.push(locales.get().info.removedLocalStyles.none)

    return messages.join(locales.get().separator)
  })

  return updatedLocalStylesStatusMessage
}

export default updateLocalStyles
