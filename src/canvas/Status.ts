import Dom from 'sketch/dom'
import { tolgee } from '../runUicp'
import Tag from './Tag'

const Group = Dom.Group
const StackLayout = Dom.StackLayout
const FlexSizing = Dom.FlexSizing

export default class Status {
  private status: {
    isClosestToRef: boolean
    isLocked: boolean
    isTransparent: boolean
  }
  private source: { [key: string]: number }
  node: any

  constructor({
    status = {
      isClosestToRef: false,
      isLocked: false,
      isTransparent: false,
    },
    source = {
      r: 0,
      g: 0,
      b: 0,
    },
  }: {
    status: {
      isClosestToRef: boolean
      isLocked: boolean
      isTransparent: boolean
    }
    source: { [key: string]: number }
  }) {
    this.status = status
    this.source = source
    this.node = this.makeNode()
  }

  makeNode = () => {
    // Insert
    const layers: Array<any> = []

    if (this.status.isClosestToRef)
      layers.push(
        new Tag({
          name: '_close',
          content: tolgee.t('paletteProperties.closest'),
          fontSize: 10,
        }).makeNodeTagwithIndicator(
          [this.source.r, this.source.g, this.source.b, 1],
          false
        )
      )

    if (this.status.isLocked)
      layers.push(
        new Tag({
          name: '_lock',
          content: tolgee.t('paletteProperties.locked'),
          fontSize: 10,
        }).makeNodeTag()
      )

    if (this.status.isTransparent)
      layers.push(
        new Tag({
          name: '_transparent',
          content: 'Transparent',
          fontSize: 10,
        }).makeNodeTag()
      )

    // Base
    this.node = new Group({
      name: '_status',
      stackLayout: {
        direction: StackLayout.Direction.Row,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 4,
        crossAxisGap: 4,
        alignItems: StackLayout.AlignItems.Center,
        justifyContent: StackLayout.JustifyContent.Start,
        wraps: true,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
      layers: layers,
    })

    // Layout
    this.node.horizontalSizing = FlexSizing.Fill
    this.node.verticalSizing = FlexSizing.Fit

    return this.node
  }
}
