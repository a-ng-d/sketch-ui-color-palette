import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import {
  BaseConfiguration,
  MetaConfiguration,
  PaletteData,
  PaletteDataThemeItem,
  ThemeConfiguration,
  ViewConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import setPaletteName from '../utils/setPaletteName'
import globalConfig from '../global.config'
import Palette from './Palette'

const Group = Dom.Group
const Style = Dom.Style
const StackLayout = Dom.StackLayout
const GroupBehavior = Dom.GroupBehavior
const Rectangle = Dom.Rectangle

export default class Documents {
  private base: BaseConfiguration
  private themes: Array<ThemeConfiguration>
  private data: PaletteData
  private meta: MetaConfiguration
  private view: ViewConfiguration
  documents: Array<any>

  constructor({
    base,
    themes,
    data,
    meta,
    view,
  }: {
    base: BaseConfiguration
    themes: Array<ThemeConfiguration>
    data: PaletteData
    meta: MetaConfiguration
    view: ViewConfiguration
  }) {
    this.base = base
    this.themes = themes
    this.data = data
    this.meta = meta
    this.view = view
    this.documents = this.makeDocuments()
  }

  makeDocuments = () => {
    let x = 0
    const y = 0
    const documents: Array<any> = []
    const workingThemesData =
      this.data.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? this.data.themes.filter((theme) => theme.type === 'default theme')
        : this.data.themes.filter((theme) => theme.type === 'custom theme')
    const workingThemes =
      this.themes.filter((theme) => theme.type === 'custom theme').length === 0
        ? this.themes.filter((theme) => theme.type === 'default theme')
        : this.themes.filter((theme) => theme.type === 'custom theme')

    workingThemesData.forEach((theme, index) => {
      const document = this.makeDocument(workingThemes[index], theme)

      setTimeout(() => {
        x = x + 32 + document.frame.width
        document.frame.x = x
        document.frame.y = y
      }, 2000)

      documents.push(document)
    })

    return documents
  }

  makeDocument = (theme: ThemeConfiguration, data: PaletteDataThemeItem) => {
    // Base
    const document = new Group({
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 32,
          left: 32,
          bottom: 32,
          right: 32,
        },
        gap: 32,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      groupBehavior: GroupBehavior.Frame,
      frame: new Rectangle(0, 0, 1640, 100),
      style: {
        fills: [
          {
            color: theme.paletteBackground,
            fillType: Style.FillType.Color,
          },
        ],
        corners: {
          radii: 32,
        },
      },
      name: setPaletteName(
        this.base.name,
        theme.name,
        this.base.preset.name,
        this.base.colorSpace,
        theme.visionSimulationMode
      ),
      layers: [
        new Palette({
          base: this.base,
          theme: theme,
          data: data,
          meta: this.meta,
          view: this.view,
        }).node,
      ],
    })

    // Layout
    document.adjustToFit()

    // Data
    Settings.setLayerSettingForKey(document, 'type', 'UI_COLOR_PALETTE')
    Settings.setLayerSettingForKey(
      document,
      'version',
      globalConfig.versions.paletteVersion
    )
    Settings.setLayerSettingForKey(document, 'view', this.view)
    Settings.setLayerSettingForKey(document, 'id', this.meta.id)
    Settings.setLayerSettingForKey(document, 'themeId', theme.id)
    Settings.setLayerSettingForKey(
      document,
      'createdAt',
      new Date().toISOString()
    )
    Settings.setLayerSettingForKey(
      document,
      'updatedAt',
      this.meta.dates.updatedAt as string
    )
    Settings.setLayerSettingForKey(document, 'backup', {
      base: this.base,
      themes: this.themes,
      meta: this.meta,
      version: globalConfig.versions.paletteVersion,
      type: 'UI_COLOR_PALETTE',
    })

    return document
  }
}
