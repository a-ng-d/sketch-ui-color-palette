import chroma from 'chroma-js'
import {
  ColorSpaceConfiguration,
  Data,
  PaletteData,
  PaletteDataShadeItem,
  FullConfiguration,
} from "@a_ng_d/utils-ui-color-palette";
import { Case } from '@a_ng_d/figmug-utils'
import { locales } from "../../../resources/content/locales";
import Dom from "sketch/dom";
import Settings from "sketch/settings";
import { getWebContents } from "../../utils/webContents";

const exportCss = (id: string, colorSpace: ColorSpaceConfiguration) => {
  const Document = Dom.getSelectedDocument();

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, "ui_color_palettes") ?? [];
  const palette = currentPalettes.find((palette) => palette.meta.id === id);

  if (palette === undefined)
    return getWebContents().executeJavaScript(
      `sendData(${JSON.stringify({
        type: "EXPORT_PALETTE_CSS",
        data: {
          id: "",
          context: "CSS",
          colorSpace: colorSpace,
          code: locales.get().error.export,
        },
      })})`
    );

  const paletteData: PaletteData = new Data(palette).makePaletteData(),
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === "custom theme")
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === "default theme")
        : paletteData.themes.filter((theme) => theme.type === "custom theme"),
    css: Array<string> = [];

  const setValueAccordingToColorSpace = (shade: PaletteDataShadeItem) => {
    const actions: { [action: string]: () => void } = {
      RGB: () =>
        `rgb(${Math.floor(shade.rgb[0])}, ${Math.floor(
          shade.rgb[1]
        )}, ${Math.floor(shade.rgb[2])})`,
      HEX: () => shade.hex,
      HSL: () =>
        `hsl(${Math.floor(shade.hsl[0])} ${Math.floor(
          shade.hsl[1] * 100
        )}% ${Math.floor(shade.hsl[2] * 100)}%)`,
      LCH: () =>
        `lch(${Math.floor(shade.lch[0])}% ${Math.floor(
          shade.lch[1]
        )} ${Math.floor(shade.lch[2])})`,
      P3: () =>
        `color(display-p3 ${shade.gl[0].toFixed(3)} ${shade.gl[1].toFixed(
          3
        )} ${shade.gl[2].toFixed(3)})`,
    };

    return actions[colorSpace ?? "RGB"]?.();
  };

  const setValueAccordingToAlpha = (
    shade: PaletteDataShadeItem,
    source: PaletteDataShadeItem
  ) => {
    const actions: { [action: string]: () => void } = {
      RGB: () =>
        `rgb(${Math.floor(source.rgb[0])}, ${Math.floor(
          source.rgb[1]
        )}, ${Math.floor(source.rgb[2])} / ${shade.alpha?.toFixed(2) ?? 1})`,
      HEX: () =>
        chroma(source.hex)
          .alpha(shade.alpha ?? 1)
          .hex(),
      HSL: () =>
        `hsl(${Math.floor(source.hsl[0])} ${Math.floor(
          source.hsl[1] * 100
        )}% ${Math.floor(source.hsl[2] * 100)}% / ${shade.alpha?.toFixed(2) ?? 1})`,
      LCH: () =>
        `lch(${Math.floor(source.lch[0])}% ${Math.floor(
          source.lch[1]
        )} ${Math.floor(source.lch[2])} / ${shade.alpha?.toFixed(2) ?? 1})`,
      P3: () =>
        `color(display-p3 ${source.gl[0].toFixed(3)} ${source.gl[1].toFixed(
          3
        )} ${source.gl[2].toFixed(3)} / ${shade.alpha?.toFixed(2) ?? 1})`,
    };

    return actions[colorSpace ?? "RGB"]?.();
  };

  workingThemes.forEach((theme) => {
    const rowCss: Array<string> = [];
    theme.colors.forEach((color) => {
      rowCss.push(`/* ${color.name} */`);
      color.shades.reverse().forEach((shade) => {
        const source = color.shades.find((c) => c.type === "source color");

        if (source)
          rowCss.push(
            `--${new Case(color.name).doKebabCase()}-${shade.name}: ${shade.isTransparent ? setValueAccordingToAlpha(shade, source) : setValueAccordingToColorSpace(shade)};`
          );
      });

      rowCss.push("");
    });
    rowCss.pop();
    css.push(
      `:root${
        theme.type === "custom theme"
          ? `[data-theme='${new Case(theme.name).doKebabCase()}']`
          : ""
      } {\n  ${rowCss.join("\n  ")}\n}`
    );
  });

  return getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "EXPORT_PALETTE_CSS",
      data: {
        id: "",
        context: "CSS",
        colorSpace: colorSpace,
        code: css.join("\n\n"),
      },
    })})`
  );
};

export default exportCss
