import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { SettingsMessage } from '../../types/messages'
import { locales } from '../../content/locales'

const updateSettings = async (msg: SettingsMessage) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.id}`) ?? '{}'
  )

  const theme = palette.themes.find((theme) => theme.isEnabled)
  if (theme !== undefined) {
    theme.visionSimulationMode = msg.data.visionSimulationMode
    theme.textColorsTheme = msg.data.textColorsTheme
  }

  palette.base.name = msg.data.name
  palette.base.description = msg.data.description
  palette.base.colorSpace = msg.data.colorSpace
  palette.base.algorithmVersion = msg.data.algorithmVersion

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id'],
    palette.libraryData
  )

  palette.meta.dates.updatedAt = now
  penpot.ui.sendMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })
  
  penpot.currentPage?.setPluginData(
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${locales.get().events.settingsUpdated}`
  )

  return palette
}

export default updateSettings
