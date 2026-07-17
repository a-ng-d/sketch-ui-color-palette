import Dom from 'sketch/dom'
import chroma from 'chroma-js'
import {
  Channel,
  Color,
  ColorSpaceConfiguration,
  Contrast,
  HexModel,
  TextColorsThemeConfiguration,
  VisionSimulationModeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { tolgee } from '../runUicp'
import Tag from './Tag'

const Group = Dom.Group
const StackLayout = Dom.StackLayout
const FlexSizing = Dom.FlexSizing

export default class Properties {
  private name: string
  private rgb: Channel
  private alpha?: number
  private mixedColor?: Channel
  private colorSpace: ColorSpaceConfiguration
  private visionSimulationMode: VisionSimulationModeConfiguration
  private textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  private hex: HexModel
  private lch: Array<number>
  private oklch: Array<number>
  private lab: Array<number>
  private oklab: Array<number>
  private hsl: Array<number>
  private hsluv: Array<number>
  private lightTextColor: Channel
  private darkTextColor: Channel
  private lightTextColorContrast: Contrast
  private darkTextColorContrast: Contrast
  private nodeTopProps: any | null
  private nodeBottomProps: any | null
  private nodeBaseProps: any | null
  private nodeContrastScoresProps: any | null
  private nodeDetailedBaseProps: any | null
  private nodeDetailedWCAGScoresProps: any | null
  private nodeDetailedAPCAScoresProps: any | null
  private nodeColumns: any | null
  private nodeLeftColumn: any | null
  private nodeRightColumn: any | null
  private node: any | null

  constructor({
    name,
    rgb,
    alpha,
    mixedColor,
    colorSpace,
    visionSimulationMode,
    textColorsTheme,
  }: {
    name: string
    rgb: Channel
    alpha?: number
    mixedColor?: Channel
    colorSpace: ColorSpaceConfiguration
    visionSimulationMode: VisionSimulationModeConfiguration
    textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  }) {
    this.name = name
    this.rgb = rgb
    this.alpha = alpha
    this.mixedColor = mixedColor
    this.colorSpace = colorSpace
    this.visionSimulationMode = visionSimulationMode
    this.textColorsTheme = textColorsTheme
    this.hex = chroma(rgb).hex()
    this.lch = chroma(rgb).lch()
    this.oklch = chroma(rgb).oklch()
    this.lab = chroma(rgb).lab()
    this.oklab = chroma(rgb).oklab()
    this.hsl = chroma(rgb).hsl()
    this.hsluv = new Color({
      sourceColor: rgb,
      visionSimulationMode: this.visionSimulationMode,
    }).getHsluv()
    this.lightTextColor = new Color({
      sourceColor: chroma(this.textColorsTheme.lightColor).rgb(),
      visionSimulationMode: this.visionSimulationMode,
    }).setColor() as Channel
    this.darkTextColor = new Color({
      sourceColor: chroma(this.textColorsTheme.darkColor).rgb(),
      visionSimulationMode: this.visionSimulationMode,
    }).setColor() as Channel
    this.lightTextColorContrast = new Contrast({
      backgroundColor: this.alpha !== undefined ? this.mixedColor : this.rgb,
      textColor: chroma(this.lightTextColor).hex(),
    })
    this.darkTextColorContrast = new Contrast({
      backgroundColor: this.alpha !== undefined ? this.mixedColor : this.rgb,
      textColor: chroma(this.darkTextColor).hex(),
    })
    this.nodeTopProps = null
    this.nodeBottomProps = null
    this.nodeBaseProps = null
    this.nodeContrastScoresProps = null
    this.nodeDetailedBaseProps = null
    this.nodeDetailedWCAGScoresProps = null
    this.nodeDetailedAPCAScoresProps = null
    this.nodeColumns = null
    this.nodeLeftColumn = null
    this.nodeRightColumn = null
    this.node = null
  }

  transformRecommendedUsage = (
    recommendedUsage:
      | 'UNKNOWN'
      | 'AVOID'
      | 'NON_TEXT'
      | 'SPOT_TEXT'
      | 'HEADLINES'
      | 'BODY_TEXT'
      | 'CONTENT_TEXT'
      | 'FLUENT_TEXT'
  ) => {
    if (recommendedUsage === 'AVOID') return tolgee.t('paletteProperties.avoid')
    else if (recommendedUsage === 'NON_TEXT')
      return tolgee.t('paletteProperties.nonText')
    else if (recommendedUsage === 'SPOT_TEXT')
      return tolgee.t('paletteProperties.spotText')
    else if (recommendedUsage === 'HEADLINES')
      return tolgee.t('paletteProperties.headlines')
    else if (recommendedUsage === 'BODY_TEXT')
      return tolgee.t('paletteProperties.bodyText')
    else if (recommendedUsage === 'CONTENT_TEXT')
      return tolgee.t('paletteProperties.contentText')
    else if (recommendedUsage === 'FLUENT_TEXT')
      return tolgee.t('paletteProperties.fluentText')
    return tolgee.t('paletteProperties.unknown')
  }

  makeNodeTopProps = () => {
    // Base
    this.nodeTopProps = new Group({
      name: '_top',
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
        fills: [{ enabled: false }],
        borders: [],
      },
    })

    // Layout
    this.nodeTopProps.horizontalSizing = FlexSizing.Fill
    this.nodeTopProps.verticalSizing = FlexSizing.Fit

    return this.nodeTopProps
  }

  makeNodeBottomProps = () => {
    // Base
    this.nodeBottomProps = new Group({
      name: '_bottom',
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
      layers: [this.makeNodeContrastScoresProps()],
    })

    // Layout
    this.nodeBottomProps.horizontalSizing = FlexSizing.Fill
    this.nodeBottomProps.verticalSizing = FlexSizing.Fit

    return this.nodeBottomProps
  }

  makeNodeBaseProps = () => {
    // Base
    const layers: Array<any> = []

    let basePropViaColorSpace

    if (this.colorSpace === 'LCH')
      basePropViaColorSpace = new Tag({
        name: '_lch',
        content: `L ${Math.floor(this.lch[0])} • C ${Math.floor(
          this.lch[1]
        )} • H ${isNaN(this.lch[2]) ? 0 : Math.floor(this.lch[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'OKLCH')
      basePropViaColorSpace = new Tag({
        name: '_oklch',
        content: `L ${parseFloat(this.oklch[0].toFixed(2))} • C ${parseFloat(
          this.oklch[1].toFixed(2)
        )} • H ${isNaN(this.oklch[2]) ? 0 : Math.floor(this.oklch[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'LAB')
      basePropViaColorSpace = new Tag({
        name: '_lab',
        content: `L ${Math.floor(this.lab[0])} • A ${Math.floor(
          this.lab[1]
        )} • B ${Math.floor(this.lab[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'OKLAB')
      basePropViaColorSpace = new Tag({
        name: '_oklab',
        content: `L ${parseFloat(this.oklab[0].toFixed(2))} • A ${parseFloat(
          this.oklab[1].toFixed(2)
        )} • B ${parseFloat(this.oklab[2].toFixed(2))}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'HSL')
      basePropViaColorSpace = new Tag({
        name: '_hsl',
        content: `H ${isNaN(this.hsl[0]) ? 0 : Math.floor(this.hsl[0])} • S ${Math.floor(
          this.hsl[1] * 100
        )} • L ${Math.floor(this.hsl[2] * 100)}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'HSLUV')
      basePropViaColorSpace = new Tag({
        name: '_hsluv',
        content: `H ${Math.floor(this.hsluv[0])} • S ${Math.floor(
          this.hsluv[1]
        )} • L ${Math.floor(this.hsluv[2])}`,
      }).makeNodeTag()

    // Insert
    if (this.alpha !== undefined) {
      const basePropViaAlpha = new Tag({
        name: '_alpha',
        content: `A ${this.alpha.toString()}`,
      }).makeNodeTag()

      layers.push(basePropViaAlpha)
    }
    layers.push(basePropViaColorSpace)
    layers.push(
      new Tag({
        name: '_hex',
        content: this.hex.toUpperCase(),
      }).makeNodeTag()
    )

    this.nodeBaseProps = new Group({
      name: '_base',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 4,
        alignItems: StackLayout.AlignItems.End,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
      layers: layers,
    })

    // Layout
    this.nodeBaseProps.horizontalSizing = FlexSizing.Fill
    this.nodeBaseProps.verticalSizing = FlexSizing.Fit

    return this.nodeBaseProps
  }

  makeNodeContrastScoresProps = () => {
    // Insert
    // WCAG
    const wcagLightContrast = this.lightTextColorContrast
        .getWCAGContrast()
        .toFixed(2),
      wcagDarkContrast = this.darkTextColorContrast
        .getWCAGContrast()
        .toFixed(2),
      wcagLightScore = this.lightTextColorContrast.getWCAGScore(),
      wcagDarkScore = this.darkTextColorContrast.getWCAGScore()

    const nodeWCAGLightProp = new Tag({
        name: '_wcag21-light',
        content: wcagLightContrast,
      }).makeNodeTagwithIndicator(chroma(this.lightTextColor).gl()),
      nodeWCAGLightScore = new Tag({
        name: '_wcag21-light-score',
        content: wcagLightScore,
        backgroundColor: {
          rgb: this.lightTextColorContrast.getWCAGScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeWCAGDarkProp = new Tag({
        name: '_wcag21-dark',
        content: wcagDarkContrast,
      }).makeNodeTagwithIndicator(chroma(this.darkTextColor).gl()),
      nodeWCAGDarkScore = new Tag({
        name: '_wcag21-dark-score',
        content: wcagDarkScore,
        backgroundColor: {
          rgb: this.darkTextColorContrast.getWCAGScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeWCAGLightProp.layers.unshift(nodeWCAGLightScore)
    nodeWCAGDarkProp.layers.unshift(nodeWCAGDarkScore)

    // APCA
    const apcaLightContrast = this.lightTextColorContrast
        .getAPCAContrast()
        .toFixed(1),
      apcaLightRecommendation = this.transformRecommendedUsage(
        this.lightTextColorContrast.getRecommendedUsage()
      ),
      apcaDarkContrast = this.darkTextColorContrast
        .getAPCAContrast()
        .toFixed(1),
      apcaDarkRecommendation = this.transformRecommendedUsage(
        this.darkTextColorContrast.getRecommendedUsage()
      )

    const nodeAPCALightProp = new Tag({
        name: '_apca-light',
        content: `Lc ${apcaLightContrast}`,
      }).makeNodeTagwithIndicator(chroma(this.lightTextColor).gl()),
      nodeAPCALightScore = new Tag({
        name: '_apca-light-score',
        content: apcaLightRecommendation,
        backgroundColor: {
          rgb: this.lightTextColorContrast.getAPCAScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeAPCADarkProp = new Tag({
        name: '_apca-dark',
        content: `Lc ${apcaDarkContrast}`,
      }).makeNodeTagwithIndicator(chroma(this.darkTextColor).gl()),
      nodeAPCADarkScore = new Tag({
        name: '_apca-dark-score',
        content: apcaDarkRecommendation,
        backgroundColor: {
          rgb: this.darkTextColorContrast.getAPCAScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeAPCALightProp.layers.unshift(nodeAPCALightScore)
    nodeAPCADarkProp.layers.unshift(nodeAPCADarkScore)

    this.nodeContrastScoresProps = new Group({
      name: '_contrast-scores',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 4,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
      layers: [
        nodeWCAGDarkProp,
        nodeAPCADarkProp,
        nodeWCAGLightProp,
        nodeAPCALightProp,
      ],
    })

    // Layout
    this.nodeContrastScoresProps.horizontalSizing = FlexSizing.Fill
    this.nodeContrastScoresProps.verticalSizing = FlexSizing.Fit

    return this.nodeContrastScoresProps
  }

  makeNodeDetailedBaseProps = () => {
    // Base
    const layers: Array<any> = []

    let basePropViaColorSpace

    if (this.colorSpace === 'LCH')
      basePropViaColorSpace = new Tag({
        name: '_lch',
        content: `L ${Math.floor(this.lch[0])} • C ${Math.floor(
          this.lch[1]
        )} • H ${isNaN(this.lch[2]) ? 0 : Math.floor(this.lch[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'OKLCH')
      basePropViaColorSpace = new Tag({
        name: '_oklch',
        content: `L ${parseFloat(this.oklch[0].toFixed(2))} • C ${parseFloat(
          this.oklch[1].toFixed(2)
        )} • H ${isNaN(this.oklch[2]) ? 0 : Math.floor(this.oklch[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'LAB')
      basePropViaColorSpace = new Tag({
        name: '_lab',
        content: `L ${Math.floor(this.lab[0])} • A ${Math.floor(
          this.lab[1]
        )} • B ${Math.floor(this.lab[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'OKLAB')
      basePropViaColorSpace = new Tag({
        name: '_oklab',
        content: `L ${parseFloat(this.oklab[0].toFixed(2))} • A ${parseFloat(
          this.oklab[1].toFixed(2)
        )} • B ${parseFloat(this.oklab[2].toFixed(2))}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'HSL')
      basePropViaColorSpace = new Tag({
        name: '_hsl',
        content: `H ${isNaN(this.hsl[0]) ? 0 : Math.floor(this.hsl[0])} • S ${Math.floor(
          this.hsl[1] * 100
        )} • L ${Math.floor(this.hsl[2] * 100)}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'HSLUV')
      basePropViaColorSpace = new Tag({
        name: '_hsluv',
        content: `H ${Math.floor(this.hsluv[0])} • S ${Math.floor(
          this.hsluv[1]
        )} • L ${Math.floor(this.hsluv[2])}`,
      }).makeNodeTag()

    // Insert
    if (this.alpha !== undefined) {
      const basePropViaAlpha = new Tag({
        name: '_alpha',
        content: `A ${this.alpha.toString()}`,
      }).makeNodeTag()

      layers.push(basePropViaAlpha)
    }

    layers.push(basePropViaColorSpace)
    layers.push(
      new Tag({
        name: '_hex',
        content: this.hex.toUpperCase(),
      }).makeNodeTag()
    )
    layers.push(
      new Tag({
        name: '_title',
        content: tolgee.t('paletteProperties.base'),
        fontSize: 10,
      }).makeNodeTag()
    )

    this.nodeDetailedBaseProps = new Group({
      name: '_base',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 4,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
      layers: layers,
    })

    // Layout
    this.nodeDetailedBaseProps.horizontalSizing = FlexSizing.Fill
    this.nodeDetailedBaseProps.verticalSizing = FlexSizing.Fit

    return this.nodeDetailedBaseProps
  }

  makeDetailedWCAGScoresProps = () => {
    // Insert
    const wcagLightContrast = this.lightTextColorContrast
        .getWCAGContrast()
        .toFixed(2),
      wcagDarkContrast = this.darkTextColorContrast
        .getWCAGContrast()
        .toFixed(2),
      wcagLightScore = this.lightTextColorContrast.getWCAGScore(),
      wcagDarkScore = this.darkTextColorContrast.getWCAGScore()

    const nodeWCAGLightProp = new Tag({
        name: '_wcag21-light',
        content: wcagLightContrast,
      }).makeNodeTagwithIndicator(chroma(this.lightTextColor).gl()),
      nodeWCAGLightScore = new Tag({
        name: '_wcag21-light-score',
        content: wcagLightScore,
        backgroundColor: {
          rgb: this.lightTextColorContrast.getWCAGScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeWCAGDarkProp = new Tag({
        name: '_wcag21-dark',
        content: wcagDarkContrast,
      }).makeNodeTagwithIndicator(chroma(this.darkTextColor).gl()),
      nodeWCAGDarkScore = new Tag({
        name: '_wcag21-dark-score',
        content: wcagDarkScore,
        backgroundColor: {
          rgb: this.darkTextColorContrast.getWCAGScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeWCAGLightProp.layers.unshift(nodeWCAGLightScore)
    nodeWCAGDarkProp.layers.unshift(nodeWCAGDarkScore)

    this.nodeDetailedWCAGScoresProps = new Group({
      name: '_wcag-scores',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 4,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
      layers: [
        nodeWCAGDarkProp,
        nodeWCAGLightProp,
        new Tag({
          name: '_title',
          content: tolgee.t('paletteProperties.wcag'),
          fontSize: 10,
        }).makeNodeTag(),
      ],
    })

    // Layout
    this.nodeDetailedWCAGScoresProps.horizontalSizing = FlexSizing.Fill
    this.nodeDetailedWCAGScoresProps.verticalSizing = FlexSizing.Fit

    return this.nodeDetailedWCAGScoresProps
  }

  makeNodeDetailedAPCAScoresProps = () => {
    const minimumDarkFontSize: Array<string | number> =
        this.darkTextColorContrast.getMinFontSizes(),
      minimumLightFontSize: Array<string | number> =
        this.lightTextColorContrast.getMinFontSizes()

    // Insert
    const apcaLightContrast = this.lightTextColorContrast
        .getAPCAContrast()
        .toFixed(1),
      apcaLightRecommendation = this.transformRecommendedUsage(
        this.lightTextColorContrast.getRecommendedUsage()
      ),
      apcaDarkContrast = this.darkTextColorContrast
        .getAPCAContrast()
        .toFixed(1),
      apcaDarkRecommendation = this.transformRecommendedUsage(
        this.darkTextColorContrast.getRecommendedUsage()
      )

    const nodeAPCALightProp = new Tag({
        name: '_apca-light',
        content: `Lc ${apcaLightContrast}`,
      }).makeNodeTagwithIndicator(chroma(this.lightTextColor).gl()),
      nodeAPCALightScore = new Tag({
        name: '_apca-light-score',
        content: apcaLightRecommendation,
        backgroundColor: {
          rgb: this.lightTextColorContrast.getAPCAScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeAPCADarkProp = new Tag({
        name: '_apca-dark',
        content: `Lc ${apcaDarkContrast}`,
      }).makeNodeTagwithIndicator(chroma(this.darkTextColor).gl()),
      nodeAPCADarkScore = new Tag({
        name: '_apca-dark-score',
        content: apcaDarkRecommendation,
        backgroundColor: {
          rgb: this.darkTextColorContrast.getAPCAScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeAPCALightProp.layers.unshift(nodeAPCALightScore)
    nodeAPCADarkProp.layers.unshift(nodeAPCADarkScore)

    const nodeColumns = this.makeNodeColumns(
      [
        new Tag({
          name: '_700-light',
          content: `${minimumLightFontSize[7]}pt (Bold 700)`,
        }).makeNodeTag(),
        new Tag({
          name: '_600-light',
          content: `${minimumLightFontSize[6]}pt (Semi-Bold 600)`,
        }).makeNodeTag(),
        new Tag({
          name: '_500-light',
          content: `${minimumLightFontSize[5]}pt (Medium 500)`,
        }).makeNodeTag(),
        new Tag({
          name: '_400-light',
          content: `${minimumLightFontSize[4]}pt (Regular 400)`,
        }).makeNodeTag(),
        new Tag({
          name: '_300-light',
          content: `${minimumLightFontSize[3]}pt (Light 300)`,
        }).makeNodeTag(),
        new Tag({
          name: '_200-light',
          content: `${minimumLightFontSize[2]}pt (Extra-Light 200)`,
        }).makeNodeTag(),
        new Tag({
          name: '_minimum-font-sizes',
          content: tolgee.t('paletteProperties.fontSize'),
        }).makeNodeTag(),
        nodeAPCALightProp,
      ],
      [
        new Tag({
          name: '_700-dark',
          content: `${minimumDarkFontSize[7]}pt (Bold 700)`,
        }).makeNodeTag(),
        new Tag({
          name: '_600-dark',
          content: `${minimumDarkFontSize[6]}pt (Semi-Bold 600)`,
        }).makeNodeTag(),
        new Tag({
          name: '_500-dark',
          content: `${minimumDarkFontSize[5]}pt (Medium 500)`,
        }).makeNodeTag(),
        new Tag({
          name: '_400-dark',
          content: `${minimumDarkFontSize[4]}pt (Regular 400)`,
        }).makeNodeTag(),
        new Tag({
          name: '_300-dark',
          content: `${minimumDarkFontSize[3]}pt (Light 300)`,
        }).makeNodeTag(),
        new Tag({
          name: '_200-dark',
          content: `${minimumDarkFontSize[2]}pt (Extra-Light 200)`,
        }).makeNodeTag(),
        new Tag({
          name: '_minimum-font-sizes',
          content: tolgee.t('paletteProperties.fontSize'),
        }).makeNodeTag(),
        nodeAPCADarkProp,
      ]
    )

    this.nodeDetailedAPCAScoresProps = new Group({
      name: '_apca-scores',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 4,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
      layers: [
        nodeColumns,
        new Tag({
          name: '_title',
          content: tolgee.t('paletteProperties.apca'),
          fontSize: 10,
        }).makeNodeTag(),
      ],
    })

    // Layout
    this.nodeDetailedAPCAScoresProps.horizontalSizing = FlexSizing.Fill
    this.nodeDetailedAPCAScoresProps.verticalSizing = FlexSizing.Fit

    return this.nodeDetailedAPCAScoresProps
  }

  makeNodeColumns(leftNodes: Array<any>, rightNodes: Array<any>) {
    // Base
    this.nodeLeftColumn = new Group({
      name: '_left-column',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 4,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
      layers: leftNodes,
    })

    this.nodeRightColumn = new Group({
      name: '_right-column',
      stackLayout: {
        direction: StackLayout.Direction.Column,
        padding: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        gap: 4,
        alignItems: StackLayout.AlignItems.Start,
        justifyContent: StackLayout.JustifyContent.Start,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
      layers: rightNodes,
    })

    this.nodeColumns = new Group({
      name: '_columns',
      stackLayout: {
        direction: StackLayout.Direction.Row,
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
      layers: [this.nodeRightColumn, this.nodeLeftColumn],
    })

    // Layout
    this.nodeLeftColumn.horizontalSizing = FlexSizing.Fill
    this.nodeLeftColumn.verticalSizing = FlexSizing.Fit
    this.nodeRightColumn.horizontalSizing = FlexSizing.Fill
    this.nodeRightColumn.verticalSizing = FlexSizing.Fit
    this.nodeColumns.horizontalSizing = FlexSizing.Fill
    this.nodeColumns.verticalSizing = FlexSizing.Fit

    return this.nodeColumns
  }

  makeNodeDetailed = () => {
    // Insert
    const detailedBaseProps = this.makeNodeDetailedBaseProps()
    const detailedWCAGScoresProps = this.makeDetailedWCAGScoresProps()
    const detailedAPCAScoresProps = this.makeNodeDetailedAPCAScoresProps()
    const nodeColumns = this.makeNodeColumns(
      [detailedBaseProps],
      [detailedWCAGScoresProps]
    )

    // Base
    this.node = new Group({
      name: '_properties',
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
        fills: [{ enabled: false }],
        borders: [],
      },
      layers: [detailedAPCAScoresProps, nodeColumns],
    })

    // Layout
    this.node.horizontalSizing = FlexSizing.Fill
    this.node.verticalSizing = FlexSizing.Fill

    return this.node
  }

  makeNode = () => {
    // Insert
    const nodeTopProps = this.makeNodeTopProps()
    const nodeBaseProps = this.makeNodeBaseProps()
    const nodeBottomProps = this.makeNodeBottomProps()

    if (this.nodeTopProps) {
      this.nodeTopProps.layers.push(nodeBaseProps)
      this.nodeTopProps.layers.push(
        new Tag({
          name: '_scale',
          content: this.name,
          fontSize: 10,
        }).makeNodeTag()
      )
    }

    // Base
    this.node = new Group({
      name: '_properties',
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
        justifyContent: StackLayout.JustifyContent.Between,
      },
      style: {
        fills: [{ enabled: false }],
        borders: [],
      },
      layers: [nodeBottomProps, nodeTopProps],
    })

    // Layout
    this.node.horizontalSizing = FlexSizing.Fill
    this.node.verticalSizing = FlexSizing.Fill

    return this.node
  }
}
