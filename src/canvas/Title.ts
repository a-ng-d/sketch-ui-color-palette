import Dom from 'sketch/dom'
import {
  BaseConfiguration,
  MetaConfiguration,
  PaletteDataThemeItem,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { tolgee } from '../runUicp'
import Tag from './Tag'
import { bodyFontFamily } from './styles'
import Paragraph from './Paragraph'

const Group = Dom.Group
const StackLayout = Dom.StackLayout
const FlexSizing = Dom.FlexSizing
const GroupBehavior = Dom.GroupBehavior
const Rectangle = Dom.Rectangle

declare const NSURL: any
declare const NSImage: any

export default class Title {
  private base: BaseConfiguration
  private theme: ThemeConfiguration
  private data: PaletteDataThemeItem
  private meta: MetaConfiguration
  private nodeGlobalInfo: any | null
  private nodeDescriptions: any | null
  private nodeProps: any | null
  node: any

  constructor({
    base,
    theme,
    data,
    meta,
  }: {
    base: BaseConfiguration
    theme: ThemeConfiguration
    data: PaletteDataThemeItem
    meta: MetaConfiguration
  }) {
    this.base = base
    this.theme = theme
    this.data = data
    this.meta = meta
    this.nodeGlobalInfo = null
    this.nodeDescriptions = null
    this.nodeProps = null
    this.node = this.makeNode()
  }

  private loadImageFromUrl = (url: string): any | null => {
    try {
      const nsurl = NSURL.URLWithString(url)
      const nsimage = NSImage.alloc().initWithContentsOfURL(nsurl)
      return nsimage || null
    } catch (e) {
      return null
    }
  }
  makeNodeGlobalInfo = () => {
    // Base
    this.nodeGlobalInfo = new Group({
      name: '_palette-global',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 8,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Between,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
    })

    // Layout
    this.nodeGlobalInfo.horizontalSizing = FlexSizing.Fit
    this.nodeGlobalInfo.verticalSizing = FlexSizing.Fit

    // Insert
    if (this.base.description !== '' || this.theme.description !== '')
      this.nodeGlobalInfo.layers.push(this.makeNodeDescriptions())
    this.nodeGlobalInfo.layers.push(
      new Tag({
        name: '_name',
        content: this.base.name === '' ? tolgee.t('name') : this.base.name,
        fontSize: 20,
      }).makeNodeTag()
    )

    return this.nodeGlobalInfo
  }

  makeNodeDescriptions = () => {
    // Base
    this.nodeDescriptions = new Group({
      name: '_palette-description(s)',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 8,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
    })

    // Layout
    this.nodeDescriptions.horizontalSizing = FlexSizing.Fit
    this.nodeDescriptions.verticalSizing = FlexSizing.Fit

    // Insert
    if (this.theme.description !== '')
      this.nodeDescriptions.layers.push(
        new Paragraph({
          name: '_theme-description',
          content: tolgee.t('paletteProperties.themeDescription', {
            description: this.theme.description,
          }),
          type: 'FIXED',
          width: 644,
          fontSize: 12,
          fontFamily: bodyFontFamily,
        }).node
      )

    if (this.base.description !== '')
      this.nodeDescriptions.layers.push(
        new Paragraph({
          name: '_palette-description',
          content: this.base.description,
          type: 'FIXED',
          width: 644,
          fontSize: 12,
          fontFamily: bodyFontFamily,
        }).node
      )

    return this.nodeDescriptions
  }

  makeNodeProps = () => {
    // Base
    this.nodeProps = new Group({
      name: '_palette-props',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 8,
        alignItems: StackLayout.AlignItems.End,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
    })
    this.nodeProps.name = '_palette-props'
    this.nodeProps.fills = []

    // Layout
    this.nodeProps.horizontalSizing = FlexSizing.Fit
    this.nodeProps.verticalSizing = FlexSizing.Fit

    // Insert
    this.nodeProps.layers.push(
      new Tag({
        name: '_updated_at',
        content: tolgee.t('paletteProperties.updatedAt', {
          date: new Date(this.meta.dates.updatedAt).toLocaleDateString(
            tolgee.getLanguage(),
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }
          ),
        }),
        fontSize: 12,
      }).makeNodeTag()
    )
    if (this.base.visionSimulationMode !== 'NONE')
      this.nodeProps.layers.push(
        new Tag({
          name: '_vision-simulation',
          content: tolgee.t('paletteProperties.visionSimulation', {
            mode:
              this.theme.visionSimulationMode.charAt(0) +
              this.theme.visionSimulationMode.toLocaleLowerCase().slice(1),
          }),
          fontSize: 12,
        }).makeNodeTag()
      )
    this.nodeProps.layers.push(
      new Tag({
        name: '_color-space',
        content: tolgee.t('paletteProperties.colorSpace', {
          name: this.base.colorSpace,
        }),
        fontSize: 12,
      }).makeNodeTag()
    )
    this.nodeProps.layers.push(
      new Tag({
        name: '_preset',
        content: tolgee.t('paletteProperties.preset', {
          name: this.base.preset.name,
        }),
        fontSize: 12,
      }).makeNodeTag()
    )
    if (this.data.type !== 'default theme')
      this.nodeProps.layers.push(
        new Tag({
          name: '_theme',
          content: tolgee.t('paletteProperties.theme', {
            name: this.data.name,
          }),
          fontSize: 12,
        }).makeNodeTag()
      )
    if (
      this.meta.publicationStatus.isPublished &&
      this.meta.creatorIdentity.creatorAvatar !== ''
    ) {
      const avatarImage = this.loadImageFromUrl(
        this.meta.creatorIdentity.creatorAvatar
      )
      this.nodeProps.layers.push(
        new Tag({
          name: '_provider',
          content: tolgee.t('paletteProperties.provider', {
            name: this.meta.creatorIdentity.creatorFullName,
          }),
          fontSize: 12,
        }).makeNodeTagWithAvatar(avatarImage)
      )
    }

    return this.nodeProps
  }

  makeNode = () => {
    // Base
    this.node = new Group({
      name: '_title',
      stackLayout: {
        direction: StackLayout.Direction.Row,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 0,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Between,
      },
      groupBehavior: GroupBehavior.Frame,
      frame: new Rectangle(0, 0, 100, 48),
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
      layers: [this.makeNodeProps(), this.makeNodeGlobalInfo()],
    })

    // Layout
    this.node.horizontalSizing = FlexSizing.Fill
    this.node.verticalSizing = FlexSizing.Fit

    return this.node
  }
}
