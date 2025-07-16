import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { ColorsMessage } from '../../types/messages'
import { locales } from "../../../resources/content/locales";
import Dom from "sketch/dom";
import Settings from "sketch/settings";
import { getWebContents } from "../../utils/webContents";

const updateColors = async (msg: ColorsMessage) => {
  const Document = Dom.getSelectedDocument();
  const Page = Document.selectedPage;

  const currentPalettes: Array<FullConfiguration> =
    Settings.layerSettingForKey(Page, "ui_color_palettes") ?? [];
  const palette = currentPalettes.find((palette) => palette.meta.id === msg.id);
  const now = new Date().toISOString();

  if (palette === undefined) throw new Error(locales.get().error.fetchPalette);

  palette.base.colors = msg.data;

  palette.meta.dates.updatedAt = now;
  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "UPDATE_PALETTE_DATE",
      data: now,
    })})`
  );

  palette.libraryData = new Data(palette).makeLibraryData(
    ["style_id"],
    palette.libraryData
  );

  Settings.setLayerSettingForKey(Page, "ui_color_palettes", currentPalettes);

  return palette;
};

export default updateColors
