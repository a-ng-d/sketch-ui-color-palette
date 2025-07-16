import { locales } from "../../../resources/content/locales";
import Settings from "sketch/settings";
import Dom from "sketch/dom";
import { FullConfiguration } from "@a_ng_d/utils-ui-color-palette";

const deletePalette = async (id: string) => {
  const Document = Dom.getSelectedDocument();
  const Page = Document.selectedPage;

  const currentPalettes: Array<FullConfiguration> =
    Settings.layerSettingForKey(Page, "ui_color_palettes") ?? [];
  const palette = currentPalettes.find((palette) => palette.meta.id === id);

  if (palette === undefined)
    throw new Error(locales.get().error.unfoundPalette);

  Settings.setLayerSettingForKey(
    Page,
    "ui_color_palettes",
    currentPalettes.filter((palette) => palette.meta.id !== id)
  );

  return palette;
};

export default deletePalette;
