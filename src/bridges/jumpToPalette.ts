import { FullConfiguration } from "@a_ng_d/utils-ui-color-palette";
import { locales } from "../../resources/content/locales";
import Dom from "sketch/dom";
import Settings from "sketch/settings";
import { getWebContents } from "../utils/webContents";

const jumpToPalette = async (id: string) => {
  const Document = Dom.getSelectedDocument();

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, "ui_color_palettes") ?? [];
  const palette = currentPalettes.find((palette) => palette.meta.id === id);

  if (palette === undefined) throw new Error(locales.get().error.fetchPalette);

  palette.meta.dates.openedAt = new Date().toISOString();
  Settings.setDocumentSettingForKey(
    Document,
    "ui_color_palettes",
    currentPalettes
  );

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "LOAD_PALETTE",
      data: palette,
    })})`
  );

  return palette;
};

export default jumpToPalette;
