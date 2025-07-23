import { FullConfiguration } from "@a_ng_d/utils-ui-color-palette";
import Dom from "sketch/dom";
import Settings from "sketch/settings";
import { getWebContents } from "../utils/webContents";

const getPalettesOnCurrentPage = async (webContents?: any) => {
  const Document = Dom.getSelectedDocument();
  const sharedWebContents =
    webContents === undefined ? getWebContents() : webContents;

  const palettesList: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, "ui_color_palettes") ?? [];

  sharedWebContents.executeJavaScript(
    `sendData(${JSON.stringify({
      type: "EXPOSE_PALETTES",
      data: palettesList,
    })})`
  );

  return palettesList;
};

export default getPalettesOnCurrentPage;
