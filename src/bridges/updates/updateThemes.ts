import { Data, FullConfiguration } from "@a_ng_d/utils-ui-color-palette";
import { ThemesMessage } from "../../types/messages";
import { locales } from "../../../resources/content/locales";
import Dom from "sketch/dom";
import Settings from "sketch/settings";
import { getWebContents } from "../../utils/webContents";

const updateThemes = async (msg: ThemesMessage) => {
  const Document = Dom.getSelectedDocument();

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, "ui_color_palettes") ?? [];
  const palette = currentPalettes.find((palette) => palette.meta.id === msg.id);
  const now = new Date().toISOString();

  if (palette === undefined) throw new Error(locales.get().error.fetchPalette);

  palette.themes = msg.data;

  palette.libraryData = new Data(palette).makeLibraryData(
    ["style_id"],
    palette.libraryData
  );

  palette.meta.dates.updatedAt = now;
  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "UPDATE_PALETTE_DATE",
      data: now,
    })})`
  );

  Settings.setDocumentSettingForKey(
    Document,
    "ui_color_palettes",
    currentPalettes
  );

  return palette;
};

export default updateThemes;
