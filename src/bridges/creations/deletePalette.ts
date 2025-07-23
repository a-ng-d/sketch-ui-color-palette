import Settings from "sketch/settings";
import Dom from "sketch/dom";
import { FullConfiguration } from "@a_ng_d/utils-ui-color-palette";
import { locales } from "../../../resources/content/locales";

const deletePalette = async (id: string) => {
  const Document = Dom.getSelectedDocument();

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, "ui_color_palettes") ?? [];
  const palette = currentPalettes.find((palette) => palette.meta.id === id);

  if (palette === undefined)
    throw new Error(locales.get().error.unfoundPalette);

  Settings.setDocumentSettingForKey(
    Document,
    "ui_color_palettes",
    currentPalettes.filter((palette) => palette.meta.id !== id)
  );

  return palette;
};

export default deletePalette;
