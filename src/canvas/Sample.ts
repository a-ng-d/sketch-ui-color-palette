import Dom from 'sketch/dom'
import chroma from 'chroma-js'
import {
  Channel,
  ColorSpaceConfiguration,
  RgbModel,
  TextColorsThemeConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import Status from './Status'
import Property from './Property'
import Properties from './Properties'
import Paragraph from './Paragraph'

const Group = Dom.Group
const StackLayout = Dom.StackLayout
const FlexSizing = Dom.FlexSizing
const Rectangle = Dom.Rectangle
const Style = Dom.Style

export default class Sample {
  private name: string
  private source?: RgbModel
  private scale?: string
  private rgb: Channel
  private alpha?: number
  private backgroundColor?: Channel
  private mixedColor?: Channel
  private colorSpace: ColorSpaceConfiguration
  private visionSimulationMode: VisionSimulationModeConfiguration
  private view: ViewConfiguration
  private textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  private status: {
    isClosestToRef: boolean
    isLocked: boolean
    isTransparent: boolean
  }
  private nodeColor: any | null
  private node: any | null
  private children: any | null

  constructor({
    name,
    source,
    scale,
    rgb,
    alpha,
    backgroundColor,
    mixedColor,
    colorSpace,
    visionSimulationMode,
    view,
    textColorsTheme,
    status = {
      isClosestToRef: false,
      isLocked: false,
      isTransparent: false,
    },
  }: {
    id?: string
    name: string
    source?: RgbModel
    scale?: string
    rgb: Channel
    alpha?: number
    backgroundColor?: Channel
    mixedColor?: Channel
    colorSpace: ColorSpaceConfiguration
    visionSimulationMode: VisionSimulationModeConfiguration
    view: ViewConfiguration
    textColorsTheme: TextColorsThemeConfiguration<'HEX'>
    status?: {
      isClosestToRef: boolean
      isLocked: boolean
      isTransparent: boolean
    }
  }) {
    this.name = name
    this.source = source
    this.scale = scale
    this.rgb = rgb
    this.alpha = alpha
    this.backgroundColor = backgroundColor
    this.mixedColor = mixedColor
    this.colorSpace = colorSpace
    this.visionSimulationMode = visionSimulationMode
    this.view = view
    this.textColorsTheme = textColorsTheme
    this.status = status
    this.nodeColor = null
    this.node = null
    this.children = null
  }

  makeNodeName = ({
    mode,
    width,
    height,
  }: {
    mode: string
    width: number
    height: number
  }) => {
    // Base
    this.node = new Group({
      name: this.name,
      stackLayout: {
        direction: StackLayout.Direction.Row,
        padding: {
          top: 8,
          left: 8,
          bottom: 8,
          right: 8,
        },
        gap: 0,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
      frame: new Rectangle(0, 0, width, height),
    })

    // Layout
    this.node.verticalSizing = FlexSizing.Fixed
    this.node.horizontalSizing = FlexSizing.Fixed

    if (mode === 'FILL') {
      this.node.horizontalSizing = FlexSizing.Fixed
      this.node.horizontalSizing = FlexSizing.Fit

      this.children = new Property({
        name: '_large-label',
        content: this.name,
        size: 16,
      }).makeNode()
    } else if (mode === 'FIXED')
      this.children = new Property({
        name: '_label',
        content: this.name,
        size: 10,
      }).makeNode()

    // Insert
    this.node.layers.push(this.children)

    return this.node
  }

  makeNodeShade = ({
    width,
    height,
    name,
    isColorName = false,
  }: {
    width: number
    height: number
    name: string
    isColorName?: boolean
  }) => {
    const newFills = [
      {
        color: chroma(this.rgb)
          .alpha(this.alpha ?? 1)
          .hex(),
        fillType: Style.FillType.Color,
      },
    ]

    if (this.backgroundColor !== undefined)
      newFills.unshift({
        color: chroma(this.backgroundColor).hex(),
        fillType: Style.FillType.Color,
      })

    // Base
    this.node = new Group({
      name: name,
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 8,
          left: 8,
          bottom: 8,
          right: 8,
        },
        gap: 8,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.End,
      },
      style: {
        fills: newFills,
        borders: [],
      },
      frame: new Rectangle(0, 0, width, height),
    })
    this.node.fills = newFills

    // Layout
    this.node.verticalSizing = FlexSizing.Fixed
    this.node.horizontalSizing = FlexSizing.Fixed

    // Insert
    if (
      this.status.isClosestToRef ||
      this.status.isLocked ||
      this.status.isTransparent
    ) {
      const nodeStatus = new Status({
        status: this.status,
        source: this.source
          ? { r: this.source.r, g: this.source.g, b: this.source.b }
          : {},
      }).node

      this.node.layers.push(nodeStatus)
    }

    if (this.view.includes('PALETTE_WITH_PROPERTIES') && !isColorName) {
      const nodeProperties = new Properties({
        name: this.scale ?? '0',
        rgb: this.rgb,
        alpha: this.alpha,
        mixedColor: this.mixedColor,
        colorSpace: this.colorSpace,
        visionSimulationMode: this.visionSimulationMode,
        textColorsTheme: this.textColorsTheme,
      }).makeNode()

      this.node.layers.push(nodeProperties)
    } else if (isColorName) {
      const nodeProperty = new Property({
        name: '_label',
        content: this.name,
        size: 10,
      }).makeNode()

      this.node.layers.push(nodeProperty)
    }

    return this.node
  }

  makeNodeRichShade = ({
    width,
    height,
    name,
    description = '',
    isColorName = false,
  }: {
    width: number
    height: number
    name: string
    description?: string
    isColorName?: boolean
  }) => {
    const newFills = [
      {
        color: chroma(this.rgb)
          .alpha(this.alpha ?? 1)
          .hex(),
        fillType: Style.FillType.Color,
      },
    ]

    if (this.backgroundColor !== undefined)
      newFills.unshift({
        color: chroma(this.backgroundColor).hex(),
        fillType: Style.FillType.Color,
      })

    // Color
    const colorLayers: Array<any> = []

    if (
      this.status.isClosestToRef ||
      this.status.isLocked ||
      this.status.isTransparent
    ) {
      const nodeStatus = new Status({
        status: this.status,
        source: this.source
          ? { r: this.source.r, g: this.source.g, b: this.source.b }
          : {},
      }).node

      colorLayers.push(nodeStatus)
    }

    const nodeProperty = new Property({
      name: '_label',
      content: name,
      size: 10,
    }).makeNode()

    colorLayers.push(nodeProperty)

    this.nodeColor = new Group({
      name: '_color',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 8,
          left: 8,
          bottom: 8,
          right: 8,
        },
        gap: 8,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: newFills,
        borders: [],
        corners: {
          radii: 16,
        },
      },
      frame: new Rectangle(0, 0, 96, 96),
      layers: colorLayers,
    })

    // Layout
    this.nodeColor.horizontalSizing = FlexSizing.Fill
    this.nodeColor.verticalSizing = FlexSizing.Fixed

    // Base
    const nodeLayers: Array<any> = []

    if (isColorName && description !== '') {
      const nodeParagraph = new Paragraph({
        name: '_description',
        content: description,
        type: 'FILL',
        fontSize: 8,
      }).node

      nodeLayers.push(nodeParagraph)
    } else if (!isColorName) {
      const nodeProperties = new Properties({
        name: this.scale ?? '0',
        rgb: this.rgb,
        alpha: this.alpha,
        mixedColor: this.mixedColor,
        colorSpace: this.colorSpace,
        visionSimulationMode: this.visionSimulationMode,
        textColorsTheme: this.textColorsTheme,
      }).makeNodeDetailed()

      nodeLayers.push(nodeProperties)
    }

    nodeLayers.push(this.nodeColor)

    this.node = new Group({
      name: name,
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
      frame: new Rectangle(0, 0, width, height),
      layers: nodeLayers,
    })

    // Layout
    this.node.horizontalSizing = FlexSizing.Fixed
    this.node.verticalSizing = FlexSizing.Fixed

    return this.node
  }
}
