import Dom from 'sketch/dom'
import { darkColor } from './styles'

const Group = Dom.Group
const Text = Dom.Text
const Style = Dom.Style
const StackLayout = Dom.StackLayout
const FlexSizing = Dom.FlexSizing
const GroupBehavior = Dom.GroupBehavior
const Rectangle = Dom.Rectangle

export default class Paragraph {
  private name: string
  private content: string
  private fontSize: number
  private fontFamily: 'Martian Mono' | 'Lexend'
  private type: 'FILL' | 'FIXED'
  private width?: number
  private nodeText: any | null
  node: any

  constructor({
    name,
    content,
    type,
    width,
    fontSize = 12,
    fontFamily = 'Martian Mono',
  }: {
    name: string
    content: string
    type: 'FILL' | 'FIXED'
    width?: number
    fontSize?: number
    fontFamily?: 'Martian Mono' | 'Lexend'
  }) {
    this.name = name
    this.content = content
    this.fontSize = fontSize
    this.fontFamily = fontFamily
    this.type = type
    this.width = width
    this.nodeText = null
    this.node = this.makeNode()
  }

  makeNodeText = () => {
    // Base
    this.nodeText = new Text({
      name: '_text',
      text: this.content,
      style: {
        fontSize: this.fontSize,
        fontWeight: 8,
        lineHeight: this.fontSize * 1.3,
        alignment: Text.VerticalAlignment.left,
        fills: [
          {
            color: darkColor,
            fillType: Style.FillType.Color,
          },
        ],
        borders: [],
      },
    })

    // Layout
    if (this.nodeText) {
      this.nodeText.horizontalSizing = FlexSizing.Fill
      this.nodeText.verticalSizing = FlexSizing.Fit
    }

    return this.nodeText
  }

  makeNode() {
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
        alignItems: StackLayout.AlignItems.Center,
        justifyContent: StackLayout.JustifyContent.Center,
      },
      style: {
        fills: [
          {
            color: '#FFFFFF80',
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
      groupBehavior: GroupBehavior.Frame,
      frame: new Rectangle(0, 0, this.width, 48),
      layers: [this.makeNodeText()],
    })

    // Layout
    if (this.type === 'FIXED') {
      this.node.horizontalSizing = FlexSizing.Fixed
      this.node.verticalSizing = FlexSizing.Fit
    } else {
      this.node.horizontalSizing = FlexSizing.Fill
      this.node.verticalSizing = FlexSizing.Fit
    }

    return this.node
  }
}
