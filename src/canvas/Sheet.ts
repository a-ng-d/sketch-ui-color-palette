import Dom from 'sketch/dom'
import {
  BaseConfiguration,
  MetaConfiguration,
  PaletteDataThemeItem,
  ThemeConfiguration,
  ViewConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { tolgee } from '../runUicp'
import Title from './Title'
import Signature from './Signature'
import Sample from './Sample'
import Header from './Header'

const Group = Dom.Group
const StackLayout = Dom.StackLayout
const FlexSizing = Dom.FlexSizing
const GroupBehavior = Dom.GroupBehavior
const Rectangle = Dom.Rectangle

export default class Sheet {
  private base: BaseConfiguration
  private theme: ThemeConfiguration
  private data: PaletteDataThemeItem
  private meta: MetaConfiguration
  private view: ViewConfiguration
  private sampleScale: number
  private sampleRatio: number
  private sampleSize: number
  private gap: number
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
    this.sampleScale = 1.25
    this.sampleRatio = 2
    this.sampleSize = 184
    this.gap = 32
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
      groupBehavior: GroupBehavior.Frame,
      frame: new Rectangle(0, 0, 100, 48),
      style: {
        fills: [],
        borders: [],
      },
      layers: [
        new Sample({
          name: tolgee.t('warning.emptySourceColors'),
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
    const shadeLayers: Array<any> = []

    // Insert header
    shadeLayers.push(
      new Header({
        base: this.base,
        theme: this.theme,
        view: this.view,
        size:
          this.sampleSize * this.sampleScale * 4 +
          this.sampleSize * this.sampleRatio +
          this.gap * 4,
      }).node
    )

    this.data?.colors.forEach((color) => {
      const sourceColor = color.shades.find(
        (shade) => shade.name === 'source'
      ) ?? { hex: '#000000', rgb: [0, 0, 0] }

      // Base
      const nodeSample = new Sample({
        name: color.name,
        rgb: sourceColor.rgb,
        colorSpace: this.base.colorSpace,
        visionSimulationMode: this.theme.visionSimulationMode,
        view: this.view,
        textColorsTheme: this.theme.textColorsTheme,
      }).makeNodeRichShade({
        width: this.sampleSize * this.sampleRatio,
        height: this.sampleSize * this.sampleRatio * this.sampleScale,
        name: color.name,
        description: color.description,
        isColorName: true,
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
          alignItems: StackLayout.AlignItems.Start,
          justifyContent: StackLayout.JustifyContent.Start,
        },
        style: {
          fills: [],
          borders: [],
        },
        layers: [nodeSample],
      })

      const rowShadeLayers: Array<any> = []
      color.shades
        .filter((shade) => shade.name !== 'source')
        .reverse()
        .forEach((shade) => {
          rowShadeLayers.push(
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
            }).makeNodeRichShade({
              width: this.sampleSize * this.sampleRatio,
              height: this.sampleSize * this.sampleRatio * this.sampleScale,
              name: shade.name,
            })
          )
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
          gap: this.gap,
          alignItems: StackLayout.AlignItems.Start,
          justifyContent: StackLayout.JustifyContent.Start,
          wraps: true,
        },
        style: {
          fills: [],
          borders: [],
        },
        frame: new Rectangle(
          0,
          0,
          this.sampleSize * this.sampleRatio * 3 + this.gap * 2,
          100
        ),
        layers: rowShadeLayers,
      })

      // Layout
      this.nodeRowShades.horizontalSizing = FlexSizing.Fixed
      this.nodeRowShades.verticalSizing = FlexSizing.Fit

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
          gap: this.gap,
          alignItems: StackLayout.AlignItems.Start,
          justifyContent: StackLayout.JustifyContent.Start,
        },
        style: {
          fills: [],
          borders: [],
        },
        layers: [this.nodeRowShades, this.nodeRowSource],
      })

      // Layout
      this.nodeRow.horizontalSizing = FlexSizing.Fit
      this.nodeRow.verticalSizing = FlexSizing.Fit
      this.nodeRowSource.horizontalSizing = FlexSizing.Fit
      this.nodeRowSource.verticalSizing = FlexSizing.Fit

      shadeLayers.push(this.nodeRow)
    })

    if (this.base.colors.length === 0) shadeLayers.push(this.makeEmptyCase())

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
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [],
        borders: [],
      },
      layers: shadeLayers,
    })

    // Layout
    this.nodeShades.horizontalSizing = FlexSizing.Fit
    this.nodeShades.verticalSizing = FlexSizing.Fit

    return this.nodeShades
  }

  makeNode = () => {
    // Base
    this.node = new Group({
      name: `_colors${tolgee.t('separator')}do not edit any layer`,
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 16,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
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
