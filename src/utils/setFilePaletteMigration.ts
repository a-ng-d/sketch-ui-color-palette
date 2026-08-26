import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import {
  FullConfiguration,
  normalizeShift,
} from '@yelbolt/engine-ui-color-palette'
import globalConfig from '../global.config'
import isValidPaletteConfiguration from '../bridges/utils/isValidPaletteConfiguration'

const setFilePaletteMigration = () => {
  const Document = Dom.getSelectedDocument()

  const palettesList: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []

  let didMigrate = false

  palettesList.forEach((palette) => {
    if (
      !isValidPaletteConfiguration(palette) ||
      palette.version === globalConfig.versions.paletteVersion
    )
      return

    didMigrate = true

    palette.base.shift.chroma = normalizeShift(
      palette.base.shift?.chroma,
      'CHROMA'
    )
    palette.base.shift.hue = normalizeShift(palette.base.shift?.hue, 'HUE')

    palette.base.colors = palette.base.colors.map((color) => ({
      ...color,
      hue: {
        shift: normalizeShift(
          color.hue?.shift ?? (color as any).hueShifting,
          'HUE'
        ),
        isLocked: color.hue?.isLocked || false,
      },
      chroma: {
        shift: normalizeShift(
          color.chroma?.shift ?? (color as any).chromaShifting,
          'CHROMA'
        ),
        isLocked: color.chroma?.isLocked || false,
      },
    }))

    palette.version = globalConfig.versions.paletteVersion
  })

  if (didMigrate)
    Settings.setDocumentSettingForKey(
      Document,
      'ui_color_palettes',
      palettesList
    )
}

export default setFilePaletteMigration
