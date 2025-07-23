import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../../resources/content/locales'

const updateLocalVariables = async (id: string) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === id)

  if (palette === undefined) throw new Error(locales.get().error.unfoundPalette)

  palette.libraryData = new Data(palette).makeLibraryData(
    ['variable_id', 'hex'],
    palette.libraryData
  )

  const canDeepSyncVariables = Settings.settingForKey('can_deep_sync_variables')
  const hasThemes = palette.libraryData.some(
    (item) => !item.id.includes('00000000000')
  )

  const updatedLocalVariablesStatusMessage = await Promise.all(
    Document.swatches
  ).then((localVariables) => {
    let i = 0,
      j = 0,
      k = 0
    const messages: Array<string> = []

    if (canDeepSyncVariables ?? false) {
      const namesToRemove: Array<string> = []
      localVariables.forEach((localVariable: any) => {
        const hasVariableMatch = palette.libraryData.some((libraryItem) => {
          const path = [
            libraryItem.paletteName,
            libraryItem.themeName === ''
              ? locales.get().themes.defaultName
              : libraryItem.themeName,
            libraryItem.colorName === ''
              ? locales.get().colors.defaultName
              : libraryItem.colorName,
            libraryItem.shadeName,
          ]
            .filter((item) => item !== '' && item !== 'None')
            .join('/')

          return path === localVariable.name
        })

        if (!hasVariableMatch) {
          namesToRemove.push(localVariable.name)
          k++
        }
      })
      if (namesToRemove.length > 0)
        for (let i = Document.swatches.length - 1; i >= 0; i--)
          if (namesToRemove.includes(Document.swatches[i].name))
            Document.swatches.splice(i, 1)
    }

    palette.libraryData
      .filter((item) => {
        return hasThemes
          ? !item.id.includes('00000000000')
          : item.id.includes('00000000000')
      })
      .forEach((item) => {
        const variableMatch = localVariables.find(
          (localVariable: any) => localVariable.id === item.variableId
        )
        const hex = item.hex?.length === 7 ? item.hex + 'ff' : item.hex

        if (variableMatch !== undefined) {
          if (variableMatch.color !== hex) {
            variableMatch.color = hex
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
          .info.updatedLocalVariables.plural.replace('{count}', i.toString())
      )
    else if (i === 1)
      messages.push(locales.get().info.updatedLocalVariables.single)
    else messages.push(locales.get().info.updatedLocalVariables.none)

    if (k > 1)
      messages.push(
        locales
          .get()
          .info.removedLocalVariables.plural.replace('{count}', k.toString())
      )
    else if (k === 1)
      messages.push(locales.get().info.removedLocalVariables.single)
    else messages.push(locales.get().info.removedLocalVariables.none)

    return messages.join(locales.get().separator)
  })

  return updatedLocalVariablesStatusMessage
}

export default updateLocalVariables
