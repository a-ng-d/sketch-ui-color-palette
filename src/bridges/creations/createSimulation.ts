import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import { Data, FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import { tolgee } from '../../runUicp'

type Rgb = { r: number; g: number; b: number }

interface PaletteMatcher {
  rgb: (color: Rgb) => Rgb
  color: (value: string) => string
}

type Lab = [number, number, number]
type Lch = { l: number; c: number; h: number }
type Shade = { rgb: Rgb; lch: Lch }
type Family = { shades: Array<Shade>; hue: number; chroma: number }

const NEUTRAL_SOURCE_CHROMA = 0.015
const NEUTRAL_FAMILY_CHROMA = 0.06

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

const toOklab = ({ r, g, b }: Rgb): Lab => {
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

const toOklch = (color: Rgb): Lch => {
  const [l, a, b] = toOklab(color)
  return { l, c: Math.sqrt(a * a + b * b), h: Math.atan2(b, a) }
}

const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % (2 * Math.PI)
  return d > Math.PI ? 2 * Math.PI - d : d
}

const toHexByte = (channel: number) =>
  Math.round(Math.min(1, Math.max(0, channel)) * 255)
    .toString(16)
    .padStart(2, '0')

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const FUNCTIONAL =
  /^rgba?\(\s*([\d.]+)(%?)\s*[, ]\s*([\d.]+)(%?)\s*[, ]\s*([\d.]+)(%?)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i

const createFamilies = (palette: FullConfiguration): Array<Family> => {
  const libraryData = new Data(palette).makeLibraryData(['gl', 'alpha'])

  const hasThemes = libraryData.some((item) => !item.id.includes('00000000000'))
  const items = libraryData
    .filter((item) =>
      hasThemes
        ? !item.id.includes('00000000000')
        : item.id.includes('00000000000')
    )
    .filter((item) => item.gl !== undefined)
  const themeName = items[0]?.themeName

  const byName = new Map<string, Array<Shade>>()
  items
    .filter((item) => item.themeName === themeName)
    .forEach((item) => {
      const gl = item.gl ?? [0, 0, 0]
      const rgb = { r: gl[0], g: gl[1], b: gl[2] }
      const shades = byName.get(item.colorName) ?? []
      shades.push({ rgb, lch: toOklch(rgb) })
      byName.set(item.colorName, shades)
    })

  return Array.from(byName.values()).map((shades) => {
    const peak = shades.reduce((a, b) => (b.lch.c > a.lch.c ? b : a))
    return { shades, hue: peak.lch.h, chroma: peak.lch.c }
  })
}

const createPaletteMatcher = (
  palette: FullConfiguration
): PaletteMatcher | null => {
  const families = createFamilies(palette)
  if (families.length === 0) return null

  const chromatics = families.filter((f) => f.chroma >= NEUTRAL_FAMILY_CHROMA)
  const mostNeutral = families.reduce((a, b) => (b.chroma < a.chroma ? b : a))
  const cache = new Map<string, Rgb>()

  const rgb = (color: Rgb): Rgb => {
    const key = `${color.r},${color.g},${color.b}`
    const cached = cache.get(key)
    if (cached !== undefined) return cached

    const lch = toOklch(color)

    const family =
      lch.c < NEUTRAL_SOURCE_CHROMA || chromatics.length === 0
        ? mostNeutral
        : chromatics.reduce((a, b) =>
            hueGap(lch.h, b.hue) < hueGap(lch.h, a.hue) ? b : a
          )

    const shade = family.shades.reduce((a, b) => {
      const dA = Math.abs(a.lch.l - lch.l)
      const dB = Math.abs(b.lch.l - lch.l)
      if (dB !== dA) return dB < dA ? b : a
      return Math.abs(b.lch.c - lch.c) < Math.abs(a.lch.c - lch.c) ? b : a
    })

    cache.set(key, shade.rgb)
    return shade.rgb
  }

  const color = (value: string): string => {
    const input = value.trim()

    const hex = HEX.exec(input)
    if (hex !== null) {
      let digits = hex[1]
      if (digits.length <= 4)
        digits = digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      const match = rgb({
        r: parseInt(digits.slice(0, 2), 16) / 255,
        g: parseInt(digits.slice(2, 4), 16) / 255,
        b: parseInt(digits.slice(4, 6), 16) / 255,
      })
      return `#${toHexByte(match.r)}${toHexByte(match.g)}${toHexByte(match.b)}${digits.slice(6)}`
    }

    const functional = FUNCTIONAL.exec(input)
    if (functional !== null) {
      const channel = (raw: string, isPercent: string) =>
        isPercent === '%' ? parseFloat(raw) / 100 : parseFloat(raw) / 255
      const match = rgb({
        r: channel(functional[1], functional[2]),
        g: channel(functional[3], functional[4]),
        b: channel(functional[5], functional[6]),
      })
      const r = Math.round(match.r * 255)
      const g = Math.round(match.g * 255)
      const b = Math.round(match.b * 255)
      return functional[7] !== undefined
        ? `rgba(${r}, ${g}, ${b}, ${functional[7]})`
        : `rgb(${r}, ${g}, ${b})`
    }

    return value
  }

  return { rgb, color }
}

const remapPaints = (
  paints: Array<any> | undefined,
  match: (value: string) => string
): Array<any> | null => {
  if (paints === undefined || paints === null || paints.length === 0)
    return null

  let hasChanged = false

  paints.forEach((paint) => {
    if (paint.fillType !== 'Color' || typeof paint.color !== 'string') return

    const color = match(paint.color)
    if (color === paint.color) return

    paint.color = color
    hasChanged = true
  })

  return hasChanged ? paints : null
}

const remapShadows = (
  shadows: Array<any> | undefined,
  match: (value: string) => string
): Array<any> | null => {
  if (!Array.isArray(shadows) || shadows.length === 0) return null

  let hasChanged = false

  shadows.forEach((shadow) => {
    if (typeof shadow.color !== 'string') return

    const color = match(shadow.color)
    if (color === shadow.color) return

    shadow.color = color
    hasChanged = true
  })

  return hasChanged ? shadows : null
}

const remapLayer = (layer: any, match: (value: string) => string): boolean => {
  const style = layer.style
  if (style === undefined || style === null) return false

  let hasChanged = false

  const fills = remapPaints(style.fills, match)
  if (fills !== null) {
    style.fills = fills
    hasChanged = true
  }

  const borders = remapPaints(style.borders, match)
  if (borders !== null) {
    style.borders = borders
    hasChanged = true
  }

  const shadows = remapShadows(style.shadows, match)
  if (shadows !== null) {
    style.shadows = shadows
    hasChanged = true
  }

  const innerShadows = remapShadows(style.innerShadows, match)
  if (innerShadows !== null) {
    style.innerShadows = innerShadows
    hasChanged = true
  }

  if (layer.type === 'Text' && typeof style.textColor === 'string') {
    const textColor = match(style.textColor)
    if (textColor !== style.textColor) {
      style.textColor = textColor
      hasChanged = true
    }
  }

  return hasChanged
}

const simulateLayer = (
  layer: any,
  match: (value: string) => string
): number => {
  if (layer.hidden === true || layer.locked === true) return 0

  let changed = remapLayer(layer, match) ? 1 : 0

  if (Array.isArray(layer.layers))
    layer.layers.forEach((child: any) => {
      changed += simulateLayer(child, match)
    })

  return changed
}

const hasRecolorableColor = (layer: any): boolean => {
  const style = layer.style
  if (style === undefined || style === null) return false

  const hasColor = (items: Array<any> | undefined) =>
    Array.isArray(items) && items.some((item) => typeof item.color === 'string')

  return (
    hasColor(style.fills) ||
    hasColor(style.borders) ||
    hasColor(style.shadows) ||
    hasColor(style.innerShadows) ||
    (layer.type === 'Text' && typeof style.textColor === 'string')
  )
}

export const countSimulableLayers = (layers: Array<any>): number =>
  layers.reduce((total: number, layer: any) => {
    if (layer.hidden === true || layer.locked === true) return total
    return (
      total +
      (hasRecolorableColor(layer) ? 1 : 0) +
      (Array.isArray(layer.layers) ? countSimulableLayers(layer.layers) : 0)
    )
  }, 0)

const createSimulation = async (id: string) => {
  const Document = Dom.getSelectedDocument()

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, 'ui_color_palettes') ?? []
  const palette = currentPalettes.find((palette) => palette.meta.id === id)

  if (palette === undefined) throw new Error(tolgee.t('error.unfoundPalette'))

  const selection: Array<any> = Document.selectedLayers.layers
  if (selection.length === 0)
    return {
      notice: {
        type: 'WARNING' as const,
        message: tolgee.t('warning.emptySelection'),
      },
      layers: undefined,
    }

  const matcher = createPaletteMatcher(palette)

  if (matcher === null) throw new Error(tolgee.t('error.unfoundPalette'))

  const layers = selection.reduce(
    (total: number, layer) => total + simulateLayer(layer, matcher.color),
    0
  )

  return { notice: undefined, layers }
}

export default createSimulation
