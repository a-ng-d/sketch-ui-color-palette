import Dom from 'sketch/dom'
import { locales } from '@ui-lib/content/locales'
import {
  BaseConfiguration,
  MetaConfiguration,
  PaletteDataThemeItem,
  ThemeConfiguration,
  ViewConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import Title from './Title'
import Signature from './Signature'
import Sample from './Sample'
import Header from './Header'

const Group = Dom.Group
const StackLayout = Dom.StackLayout
const FlexSizing = Dom.FlexSizing
const GroupBehavior = Dom.GroupBehavior
const Rectangle = Dom.Rectangle

export default class Palette {
  private base: BaseConfiguration
  private theme: ThemeConfiguration
  private data: PaletteDataThemeItem
  private meta: MetaConfiguration
  private view: ViewConfiguration
  private sampleRatio: number
  private sampleSize: number
  private nodeRow: any | null
  private nodeRowSource: any | null
  private nodeRowShades: any | null
  private nodeEmpty: any | null
  private nodeShades: any | null
  node: any

  constructor({
    base,
    theme,
    data,
    meta,
    view,
  }: {
    base: BaseConfiguration
    theme: ThemeConfiguration
    data: PaletteDataThemeItem
    meta: MetaConfiguration
    view: ViewConfiguration
  }) {
    this.base = base
    this.theme = theme
    this.data = data
    this.meta = meta
    this.view = view
    this.sampleRatio = 3 / 2
    this.sampleSize = 220
    this.nodeRow = null
    this.nodeRowSource = null
    this.nodeRowShades = null
    this.nodeEmpty = null
    this.nodeShades = null
    this.node = this.makeNode()
  }

  makeEmptyCase = () => {
    // Base
    this.nodeEmpty = new Group({
      name: '_message',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 0,
        alignItems: StackLayout.AlignItems.Center,
        justifyContent: StackLayout.JustifyContent.Center,
      },
      groupBehavior: GroupBehavior.Frame,
      frame: new Rectangle(0, 0, 100, 48),
      style: {
        fills: [],
        borders: [],
      },
      layers: [
        new Sample({
          name: locales.get().warning.emptySourceColors,
          rgb: [255, 255, 255],
          colorSpace: this.base.colorSpace,
          visionSimulationMode: this.theme.visionSimulationMode,
          view: this.view,
          textColorsTheme: this.theme.textColorsTheme,
        }).makeNodeName({
          mode: 'FILL',
          width: 48,
          height: 48,
        }),
      ],
    })

    // Layout
    this.nodeEmpty.horizontalSizing = FlexSizing.Fill
    this.nodeEmpty.verticalSizing = FlexSizing.Fixed

    return this.nodeEmpty
  }

  makeNodeShades = () => {
    // Base
    this.nodeShades = new Group({
      name: '_shades',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 0,
        alignItems: StackLayout.AlignItems.Center,
        justifyContent: StackLayout.JustifyContent.Center,
      },
      style: {
        fills: [],
        borders: [],
      },
    })

    // Layout
    this.nodeShades.horizontalSizing = FlexSizing.Fit
    this.nodeShades.verticalSizing = FlexSizing.Fit

    // Insert
    this.data?.colors.reverse().forEach((color, index) => {
      const sourceColor = color.shades.find(
        (shade) => shade.name === 'source'
      ) ?? { hex: '#000000', rgb: [0, 0, 0] }

      let radii = []
      if (index === 0) radii = [0, 0, 16, 16]
      else if (index === this.data.colors.length - 1) radii = [16, 16, 0, 0]
      else radii = [0, 0, 0, 0]

      // Base
      this.nodeRow = new Group({
        name: color.name,
        stackLayout: {
          direction: StackLayout.Direction.Row,
          padding: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          },
          gap: 0,
          alignItems: StackLayout.AlignItems.Center,
          justifyContent: StackLayout.JustifyContent.Center,
        },
        style: {
          fills: [],
          borders: [],
          corners: {
            radii: radii,
          },
        },
      })

      this.nodeRowSource = new Group({
        name: '_source',
        stackLayout: {
          direction: StackLayout.Direction.Row,
          padding: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          },
          gap: 0,
          alignItems: StackLayout.AlignItems.Center,
          justifyContent: StackLayout.JustifyContent.Center,
        },
        style: {
          fills: [],
          borders: [],
        },
        layers: [
          new Sample({
            name: color.name,
            rgb: sourceColor.rgb,
            colorSpace: this.base.colorSpace,
            visionSimulationMode: this.theme.visionSimulationMode,
            view: this.view,
            textColorsTheme: this.theme.textColorsTheme,
          }).makeNodeShade({
            width: this.sampleSize,
            height: this.sampleSize * this.sampleRatio,
            name: color.name,
            isColorName: true,
          }),
        ],
      })

      this.nodeRowShades = new Group({
        name: '_shades',
        stackLayout: {
          direction: StackLayout.Direction.Row,
          padding: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          },
          gap: 0,
          alignItems: StackLayout.AlignItems.Center,
          justifyContent: StackLayout.JustifyContent.Center,
        },
        style: {
          fills: [],
          borders: [],
        },
      })

      // Layout
      if (this.nodeRow && this.nodeRowSource && this.nodeRowShades) {
        this.nodeRow.verticalSizing = FlexSizing.Fit
        this.nodeRow.horizontalSizinglSizing = FlexSizing.Fit

        this.nodeRowSource.verticalSizing = FlexSizing.Fit
        this.nodeRowSource.horizontalSizinglSizing = FlexSizing.Fit

        this.nodeRowShades.verticalSizing = FlexSizing.Fit
        this.nodeRowShades.horizontalSizinglSizing = FlexSizing.Fit
      }

      // Insert
      color.shades
        .filter((shade) => shade.name !== 'source')
        .reverse()
        .forEach((shade) => {
          this.nodeRowShades?.layers.push(
            new Sample({
              name: color.name,
              source: {
                r: sourceColor.rgb[0] / 255,
                g: sourceColor.rgb[1] / 255,
                b: sourceColor.rgb[2] / 255,
              },
              scale: shade.name,
              rgb: shade.rgb,
              alpha: shade.alpha,
              backgroundColor: shade.backgroundColor,
              mixedColor: shade.mixedColor,
              colorSpace: this.base.colorSpace,
              visionSimulationMode: this.theme.visionSimulationMode,
              view: this.view,
              textColorsTheme: this.theme.textColorsTheme,
              status: {
                isClosestToRef: shade.isClosestToRef ?? false,
                isLocked: shade.isSourceColorLocked ?? false,
                isTransparent: shade.isTransparent ?? false,
              },
            }).makeNodeShade({
              width: this.sampleSize,
              height: this.sampleSize * this.sampleRatio,
              name: shade.name,
            })
          )
        })

      this.nodeShades?.layers.push(this.nodeRow)
      this.nodeRow.layers.push(this.nodeRowShades)
      this.nodeRow.layers.push(this.nodeRowSource)
    })

    if (this.base.colors.length === 0)
      this.nodeShades.layers.push(this.makeEmptyCase())

    this.nodeShades.layers.push(
      new Header({
        base: this.base,
        theme: this.theme,
        view: this.view,
        size: this.sampleSize,
      }).node
    )

    return this.nodeShades
  }

  makeNode = () => {
    // Base
    this.node = new Group({
      name: `_colors${locales.get().separator}do not edit any layer`,
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 16,
        alignItems: StackLayout.AlignItems.Center,
        justifyContent: StackLayout.JustifyContent.Center,
      },
      style: {
        fills: [],
        borders: [],
      },
      locked: true,
      layers: [
        new Signature().node,
        this.makeNodeShades(),
        new Title({
          base: this.base,
          theme: this.theme,
          data: this.data,
          meta: this.meta,
        }).node,
      ],
    })

    // Layout
    this.node.horizontalSizing = FlexSizing.Fit
    this.node.verticalSizing = FlexSizing.Fit

    return this.node
  }
}
