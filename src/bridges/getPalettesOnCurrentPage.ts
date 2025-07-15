import { FullConfiguration } from "@a_ng_d/utils-ui-color-palette";
import { getWebContents } from "../utils/webContents";
import Dom from "sketch/dom";
import Settings from "sketch/settings";

const Document = Dom.getSelectedDocument();

const getPalettesOnCurrentPage = async () => {
  const rawDataKeys = Settings.documentSettingForKey(
    Document,
    "ui_color_palettes"
  );
  if (rawDataKeys === undefined) {
    getWebContents().executeJavaScript(
      `sendData(${JSON.stringify({
        type: "EXPOSE_PALETTES",
        data: [],
      })})`
    );
    return [];
  }

  console.log("Palettes on current page:", rawDataKeys);

  const palettesList: FullConfiguration = JSON.parse(rawDataKeys);

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "EXPOSE_PALETTES",
      data: palettesList,
    })})`
  );

  return true;
};

export default getPalettesOnCurrentPage;
