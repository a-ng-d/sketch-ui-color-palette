import Dom from 'sketch/dom'
import {
  BaseConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { tolgee } from '../runUicp'
import Sample from './Sample'

const Group = Dom.Group
const StackLayout = Dom.StackLayout
const FlexSizing = Dom.FlexSizing

export default class Header {
  private base: BaseConfiguration
  private theme: ThemeConfiguration
  private view: ViewConfiguration
  private sampleSize: number
  node: any

  constructor({
    base,
    theme,
    view,
    size,
  }: {
    base: BaseConfiguration
    theme: ThemeConfiguration
    view: ViewConfiguration
    size: number
  }) {
    this.base = base
    this.theme = theme
    this.view = view
    this.sampleSize = size
    this.node = this.makeNode()
  }

  makeNode = () => {
    // Insert
    const layers: Array<any> = []

    if (this.view === 'PALETTE' || this.view === 'PALETTE_WITH_PROPERTIES')
      Object.keys(this.theme.scale).forEach((key) => {
        layers.push(
          new Sample({
            name: key,
            rgb: [255, 255, 255],
            colorSpace: this.base.colorSpace,
            visionSimulationMode: this.theme.visionSimulationMode,
            view: this.view,
            textColorsTheme: this.theme.textColorsTheme,
          }).makeNodeName({
            mode: 'FIXED',
            width: this.sampleSize,
            height: 48,
          })
        )
      })

    layers.push(
      new Sample({
        name: tolgee.t('paletteProperties.sourceColors'),
        rgb: [255, 255, 255],
        colorSpace: this.base.colorSpace,
        visionSimulationMode: this.theme.visionSimulationMode,
        view: this.view,
        textColorsTheme: this.theme.textColorsTheme,
      }).makeNodeName({
        mode: 'FIXED',
        width: this.sampleSize,
        height: 48,
      })
    )

    // Base
    this.node = new Group({
      name: '_header',
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
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [],
        borders: [],
      },
      layers: layers,
    })

    // Layout
    this.node.horizontalSizing = FlexSizing.Fit
    this.node.verticalSizing = FlexSizing.Fit

    return this.node
  }
}
