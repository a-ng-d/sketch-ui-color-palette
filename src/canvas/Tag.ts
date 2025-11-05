import Dom from 'sketch/dom'
import chroma from 'chroma-js'
import { RgbModel } from '@a_ng_d/utils-ui-color-palette'
import { darkColor, FontFamily, propertyFontFamily } from './styles'

const Group = Dom.Group
const Text = Dom.Text
const Style = Dom.Style
const StackLayout = Dom.StackLayout
const FlexSizing = Dom.FlexSizing
const Rectangle = Dom.Rectangle
const ShapePath = Dom.ShapePath
const Image = Dom.Image

export default class Tag {
  private name: string
  private content: string
  private fontSize: number
  private fontFamily: FontFamily
  private url: string | null
  private backgroundColor: {
    rgb: RgbModel
    alpha: number
  }
  private nodeTag: any | null
  private nodeTagWithAvatar: any | null
  private nodeTagwithIndicator: any | null
  private nodeText: any | null
  private nodeIndicator: any | null
  private nodeAvatar: any | null

  constructor({
    name,
    content,
    fontSize = 8,
    fontFamily = propertyFontFamily,
    backgroundColor = {
      rgb: {
        r: 1,
        g: 1,
        b: 1,
      },
      alpha: 0.5,
    },
    url = null,
  }: {
    name: string
    content: string
    fontSize?: number
    fontFamily?: FontFamily
    backgroundColor?: {
      rgb: RgbModel
      alpha: number
    }
    url?: string | null
  }) {
    this.name = name
    this.content = content
    this.fontSize = fontSize
    this.fontFamily = fontFamily
    this.url = url
    this.backgroundColor = backgroundColor
    this.nodeTag = null
    this.nodeTagwithIndicator = null
    this.nodeTagWithAvatar = null
    this.nodeText = null
    this.nodeIndicator = null
    this.nodeAvatar = null
  }

  makeNodeTag = () => {
    // Base
    this.nodeTag = new Group({
      name: this.name,
      stackLayout: {
        direction: StackLayout.Direction.Row,
        padding: {
          top: 4,
          left: 8,
          bottom: 4,
          right: 8,
        },
        gap: 4,
        alignItems: StackLayout.AlignItems.Center,
        justifyContent: StackLayout.JustifyContent.Center,
      },
      style: {
        fills: [
          {
            color: chroma([
              this.backgroundColor.rgb.r * 255,
              this.backgroundColor.rgb.g * 255,
              this.backgroundColor.rgb.b * 255,
            ])
              .alpha(this.backgroundColor.alpha)
              .hex(),
            fillType: Style.FillType.Color,
          },
        ],
        borders: [
          {
            color: darkColor + '0D',
            fillType: Style.FillType.Color,
            position: Style.BorderPosition.Inside,
          },
        ],
        corners: {
          radii: 16,
        },
      },

      layers: [this.makeNodeText()],
    })

    // Layout
    this.nodeTag.horizontalSizing = FlexSizing.Fit
    this.nodeTag.verticalSizing = FlexSizing.Fit

    return this.nodeTag
  }

  makeNodeTagwithIndicator = (
    gl: Array<number> = [0, 0, 0, 1],
    isCompact = true
  ) => {
    // Base
    this.nodeTagwithIndicator = new Group({
      name: this.name,
      stackLayout: {
        direction: StackLayout.Direction.Row,
        padding: {
          top: isCompact ? 2 : 4,
          left: 8,
          bottom: isCompact ? 2 : 4,
          right: isCompact ? 2 : 8,
        },
        gap: 4,
        alignItems: StackLayout.AlignItems.Center,
        justifyContent: StackLayout.JustifyContent.Center,
      },
      style: {
        fills: [
          {
            color: chroma([
              this.backgroundColor.rgb.r * 255,
              this.backgroundColor.rgb.g * 255,
              this.backgroundColor.rgb.b * 255,
            ])
              .alpha(this.backgroundColor.alpha)
              .hex(),
            fillType: Style.FillType.Color,
          },
        ],
        borders: [
          {
            color: darkColor + '0D',
            fillType: Style.FillType.Color,
            position: Style.BorderPosition.Inside,
          },
        ],
        corners: {
          radii: 16,
        },
      },
      layers: [
        this.makeNodeText(),
        this.makeNodeIndicator([gl[0], gl[1], gl[2]]),
      ],
    })

    // Layout
    if (this.nodeTagwithIndicator) {
      this.nodeTagwithIndicator.horizontalSizing = FlexSizing.Fit
      this.nodeTagwithIndicator.verticalSizing = FlexSizing.Fit
    }

    return this.nodeTagwithIndicator
  }

  makeNodeTagWithAvatar = (image?: ImageData | null) => {
    // Base
    this.nodeTagWithAvatar = new Group({
      name: this.name,
      stackLayout: {
        direction: StackLayout.Direction.Row,
        padding: {
          top: 4,
          left: 8,
          bottom: 4,
          right: 4,
        },
        gap: 8,
        alignItems: StackLayout.AlignItems.Center,
        justifyContent: StackLayout.JustifyContent.Center,
      },
      style: {
        fills: [
          {
            color: chroma([
              this.backgroundColor.rgb.r * 255,
              this.backgroundColor.rgb.g * 255,
              this.backgroundColor.rgb.b * 255,
            ])
              .alpha(this.backgroundColor.alpha)
              .hex(),
            fillType: Style.FillType.Color,
          },
        ],
        borders: [
          {
            color: darkColor + '1A',
            fillType: Style.FillType.Color,
            position: Style.BorderPosition.Inside,
          },
        ],
        corners: {
          radii: 16,
        },
      },
      layers: [this.makeNodeAvatar(image), this.makeNodeText()],
    })

    // Layout
    if (this.nodeTagWithAvatar) {
      this.nodeTagWithAvatar.horizontalSizing = FlexSizing.Fit
      this.nodeTagWithAvatar.verticalSizing = FlexSizing.Fit
    }

    return this.nodeTagWithAvatar
  }

  makeNodeText = () => {
    // Base
    this.nodeText = new Text({
      name: '_text',
      text: this.content,
      style: {
        fontSize: this.fontSize,
        fontFamily: this.fontFamily,
        fontWeight: 8,
        lineHeight: this.fontSize,
        alignment: Text.VerticalAlignment.center,
        fills: [
          {
            color: darkColor,
            fillType: Style.FillType.Color,
          },
        ],
        borders: [],
      },
    })

    this.nodeText.adjustToFit()

    return this.nodeText
  }

  makeNodeIndicator = (rgb: Array<number>) => {
    // Base
    this.nodeIndicator = new ShapePath({
      name: '_indicator',
      shapeType: ShapePath.ShapeType.Oval,
      style: {
        fills: [
          {
            color: chroma([rgb[0] * 255, rgb[1] * 255, rgb[2] * 255]).hex(),
            fillType: Style.FillType.Color,
          },
        ],
        borders: [
          {
            color: darkColor + '1A',
            fillType: Style.FillType.Color,
            position: Style.BorderPosition.Inside,
          },
        ],
      },
      frame: new Rectangle(0, 0, 8, 8),
    })

    return this.nodeIndicator
  }

  makeNodeAvatar = (image?: ImageData | null) => {
    // Base
    if (image !== null && image !== undefined)
      this.nodeAvatar = new Image({
        name: '_avatar',
        image: image,
        style: {
          borders: [
            {
              color: darkColor + '1A',
              fillType: Style.FillType.Color,
              position: Style.BorderPosition.Inside,
            },
          ],
          corners: {
            radii: 12,
          },
        },
        frame: new Rectangle(0, 0, 24, 24),
      })
    else
      this.nodeAvatar = new ShapePath({
        name: '_avatar',
        shapeType: ShapePath.ShapeType.Oval,
        style: {
          fills: [
            {
              color: darkColor + '66',
              fillType: Style.FillType.Color,
            },
          ],
          borders: [
            {
              color: darkColor + '1A',
              fillType: Style.FillType.Color,
              position: Style.BorderPosition.Inside,
            },
          ],
        },
        frame: new Rectangle(0, 0, 24, 24),
      })

    return this.nodeAvatar
  }
}
