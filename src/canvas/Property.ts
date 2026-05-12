import Dom from 'sketch/dom'
import Tag from './Tag'

const Group = Dom.Group
const StackLayout = Dom.StackLayout
const FlexSizing = Dom.FlexSizing

export default class Property {
  private name: string
  private content: string
  private size: number
  private node: any | null

  constructor({
    name,
    content,
    size,
  }: {
    name: string
    content: string
    size: number
  }) {
    this.name = name
    this.content = content
    this.size = size
    this.node = null
  }

  makeNode = () => {
    // Base
    this.node = new Group({
      name: '_property',
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
        fills: [{ enabled: false }],
        borders: [],
      },
    })

    // Layout
    this.node.verticalSizing = FlexSizing.Fill
    this.node.horizontalSizing = FlexSizing.Fill

    // Insert
    this.node.layers.push(
      new Tag({
        name: this.name,
        content: this.content,
        fontSize: this.size,
      }).makeNodeTag()
    )

    return this.node
  }
}
