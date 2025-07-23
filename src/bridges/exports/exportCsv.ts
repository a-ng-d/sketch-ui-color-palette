import Settings from "sketch/settings";
import Dom from "sketch/dom";
import {
  Data,
  PaletteData,
  FullConfiguration,
} from "@a_ng_d/utils-ui-color-palette";
import { getWebContents } from "../../utils/webContents";
import { locales } from "../../../resources/content/locales";

interface colorCsv {
  name: string;
  csv: string;
}

interface themeCsv {
  name: string;
  colors: Array<colorCsv>;
  type: string;
}

const exportCsv = (id: string) => {
  const Document = Dom.getSelectedDocument();

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, "ui_color_palettes") ?? [];
  const palette = currentPalettes.find((palette) => palette.meta.id === id);

  if (palette === undefined)
    return getWebContents().executeJavaScript(
      `sendData(${JSON.stringify({
        type: "EXPORT_PALETTE_CSV",
        data: {
          id: "",
          context: "CSV",
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
    colorCsv: Array<colorCsv> = [],
    themeCsv: Array<themeCsv> = [],
    lightness: Array<string> = [],
    l: Array<number | string> = [],
    c: Array<number | string> = [],
    h: Array<number | string> = [];

  workingThemes.forEach((theme) => {
    theme.colors.forEach((color) => {
      color.shades.forEach((shade) => {
        lightness.push(shade.name);
        l.push(Math.floor(shade.lch[0]));
        c.push(Math.floor(shade.lch[1]));
        h.push(Math.floor(shade.lch[2]));
      });
      colorCsv.push({
        name: color.name,
        csv: `${color.name},Lightness,Chroma,Hue\n${lightness
          .map((stop, index) => `${stop},${l[index]},${c[index]},${h[index]}`)
          .join("\n")}`,
      });
      lightness.splice(0, lightness.length);
      l.splice(0, l.length);
      c.splice(0, c.length);
      h.splice(0, h.length);
    });
    themeCsv.push({
      name: theme.name,
      colors: colorCsv.map((c) => {
        return c;
      }),
      type: theme.type,
    });
    colorCsv.splice(0, colorCsv.length);
  });

  return getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "EXPORT_PALETTE_CSV",
      data: {
        id: "",
        context: "CSV",
        code:
          paletteData.themes[0].colors.length === 0
            ? [
                {
                  name: "empty",
                  colors: [{ csv: locales.get().warning.emptySourceColors }],
                },
              ]
            : themeCsv,
      },
    })})`
  );
};

export default exportCsv;
