import chroma from 'chroma-js'
import {
  Data,
  PaletteData,
  PaletteDataColorItem,
  PaletteDataShadeItem,
  FullConfiguration,
} from "@a_ng_d/utils-ui-color-palette";
import { locales } from "../../../resources/content/locales";
import Dom from "sketch/dom";
import Settings from "sketch/settings";
import { getWebContents } from "../../utils/webContents";

const exportJsonAmznStyleDictionary = (id: string) => {
  const Document = Dom.getSelectedDocument();

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, "ui_color_palettes") ?? [];
  const palette = currentPalettes.find((palette) => palette.meta.id === id);

  if (palette === undefined)
    return getWebContents().executeJavaScript(
      `sendData(${JSON.stringify({
        type: "EXPORT_PALETTE_JSON",
        data: {
          id: "",
          context: "TOKENS_AMZN_STYLE_DICTIONARY",
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: { [key: string]: any } = {
      color: {},
    };

  const model = (
    color: PaletteDataColorItem,
    shade: PaletteDataShadeItem,
    source: PaletteDataShadeItem
  ) => {
    return {
      value: shade.isTransparent
        ? chroma(source.hex)
            .alpha(shade.alpha ?? 1)
            .hex()
        : shade.hex,
      comment:
        color.description !== ""
          ? color.description + locales.get().separator + shade.description
          : shade.description,
    };
  };

  paletteData.themes[0].colors.forEach((color) => {
    json["color"][color.name] = {};
  });

  if (workingThemes[0].type === "custom theme")
    workingThemes.forEach((theme) => {
      theme.colors.forEach((color) => {
        const source = color.shades.find(
          (shade) => shade.type === "source color"
        );

        json["color"][color.name][theme.name] = {};
        color.shades.forEach((shade) => {
          if (shade && source)
            json["color"][color.name][theme.name][shade.name] = model(
              color,
              shade,
              source
            );
        });
      });
    });
  else
    workingThemes.forEach((theme) => {
      theme.colors.forEach((color) => {
        const source = color.shades.find(
          (shade) => shade.type === "source color"
        );

        json["color"][color.name] = {};
        color.shades.forEach((shade) => {
          if (shade && source)
            json["color"][color.name][shade.name] = model(color, shade, source);
        });
      });
    });

  return getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "EXPORT_PALETTE_JSON",
      data: {
        id: "",
        context: "TOKENS_AMZN_STYLE_DICTIONARY",
        code: JSON.stringify(json, null, "  "),
      },
    })})`
  );
};

export default exportJsonAmznStyleDictionary
