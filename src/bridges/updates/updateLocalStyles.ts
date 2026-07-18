import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { Data, FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import scheduleSaveDocument from '../../utils/scheduleSaveDocument'
import { tolgee } from '../../runUicp'

const updateLocalStyles = async (id: string) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === id)

  if (palette === undefined) throw new Error(tolgee.t('error.unfoundPalette'))

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
        const hasStyleMatch = palette.libraryData
          .filter((item) => {
            return hasThemes
              ? !item.id.includes('00000000000')
              : item.id.includes('00000000000')
          })
          .some((libraryItem) => libraryItem.styleId === localStyle.id)

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

    scheduleSaveDocument(Document)

    messages.push(tolgee.t('info.updatedLocalStyles', { count: i }))
    messages.push(tolgee.t('info.removedLocalStyles', { count: k }))

    return messages.join(tolgee.t('separator'))
  })

  return updatedLocalStylesStatusMessage
}

export default updateLocalStyles
