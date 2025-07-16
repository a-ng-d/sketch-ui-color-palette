import { FullConfiguration } from "@a_ng_d/utils-ui-color-palette";
import Dom from "sketch/dom";
import Settings from "sketch/settings";

const getPalettesOnCurrentPage = async (webContents: any) => {
  const Document = Dom.getSelectedDocument();
  const Page = Document.selectedPage;

  const palettesList: FullConfiguration =
    Settings.layerSettingForKey(Page, "ui_color_palettes") ?? [];

  webContents.executeJavaScript(
    `sendData(${JSON.stringify({
      type: "EXPOSE_PALETTES",
      data: palettesList,
    })})`
  );

  return palettesList;
};

export default getPalettesOnCurrentPage;
