import { Data, FullConfiguration } from "@a_ng_d/utils-ui-color-palette";
import { doScale } from "@a_ng_d/figmug-utils";
import { ScaleMessage } from "../../types/messages";
import { locales } from "../../../resources/content/locales";
import Dom from "sketch/dom";
import Settings from "sketch/settings";
import { getWebContents } from "../../utils/webContents";

const updateScale = async (msg: ScaleMessage) => {
  const Document = Dom.getSelectedDocument();

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, "ui_color_palettes") ?? [];
  const palette = currentPalettes.find(
    (palette) => palette.meta.id === msg.data.id
  );
  const now = new Date().toISOString();

  if (palette === undefined) throw new Error(locales.get().error.fetchPalette);

  const theme = palette.themes.find((theme) => theme.isEnabled);
  if (theme !== undefined) theme.scale = msg.data.scale;

  if (msg.feature === "ADD_STOP" || msg.feature === "DELETE_STOP")
    palette.themes
      .filter((theme) => !theme.isEnabled)
      .forEach((theme) => {
        const currentScaleArray = Object.entries(theme.scale);

        const isInverted = currentScaleArray.every((val, index, arr) => {
          if (index === 0) return true;
          return (
            parseFloat(val[1].toString()) <
            parseFloat(arr[index - 1][1].toString())
          );
        });

        const scaleValues = Object.values(theme.scale);
        const scaleMin = !isInverted
          ? Math.max(...scaleValues)
          : Math.min(...scaleValues);
        const scaleMax = !isInverted
          ? Math.min(...scaleValues)
          : Math.max(...scaleValues);

        theme.scale = doScale(
          Object.keys(msg.data.scale).map((stop) => parseFloat(stop)),
          scaleMin,
          scaleMax
        );

        if (!isInverted) {
          const newScaleArray = Object.entries(theme.scale);
          theme.scale = Object.fromEntries(newScaleArray.reverse());
        }
      });

  palette.base.preset = msg.data.preset;
  palette.base.shift = msg.data.shift;
  palette.base.preset = msg.data.preset;

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

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "LOAD_PALETTE",
      data: palette,
    })})`
  );

  Settings.setDocumentSettingForKey(
    Document,
    "ui_color_palettes",
    currentPalettes
  );

  return palette;
};

export default updateScale;
