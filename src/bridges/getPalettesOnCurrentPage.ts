import { FullConfiguration } from "@a_ng_d/utils-ui-color-palette";
import { getWebContents } from "../utils/webContents";
import Dom from "sketch/dom";
import Settings from "sketch/settings";

const Document = Dom.getSelectedDocument();
const Page = Document.selectedPage;

const getPalettesOnCurrentPage = async () => {
  const palettesList: FullConfiguration =
    Settings.layerSettingForKey(Page, "ui_color_palettes") ?? [];

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "EXPOSE_PALETTES",
      data: palettesList,
    })})`
  );

  return palettesList;
};

export default getPalettesOnCurrentPage;
