import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { locales } from "../../../resources/content/locales";
import LocalStyle from "../../canvas/LocalStyle";
import Dom from "sketch/dom";
import Settings from "sketch/settings";

const createLocalStyles = async (id: string) => {
  const Document = Dom.getSelectedDocument();
  const Page = Document.selectedPage;

  const currentPalettes: Array<FullConfiguration> =
    Settings.layerSettingForKey(Page, "ui_color_palettes") ?? [];
  const palette = currentPalettes.find((palette) => palette.meta.id === id);

  if (palette === undefined)
    throw new Error(locales.get().error.unfoundPalette);

  palette.libraryData = new Data(palette).makeLibraryData(
    ["style_id", "hex"],
    palette.libraryData
  );

  const hasThemes = palette.libraryData.some(
    (item) => !item.id.includes("00000000000")
  );

  const createdLocalStylesStatusMessage = await Promise.all(
    Document.sharedLayerStyles
  ).then((localStyles) => {
    let i = 0;

    palette.libraryData
      .filter((item) => {
        return hasThemes
          ? !item.id.includes("00000000000")
          : item.id.includes("00000000000");
      })
      .forEach((item) => {
        const path = [
          item.paletteName,
          item.themeName === ""
            ? locales.get().themes.defaultName
            : item.themeName,
          item.colorName === ""
            ? locales.get().colors.defaultName
            : item.colorName,
          item.shadeName,
        ]
          .filter((item) => item !== "" && item !== "None")
          .join("/");

        if (
          localStyles.find(
            (localStyle: any) => localStyle.id === item.styleId
          ) === undefined &&
          item.hex !== undefined
        ) {
          const style = new LocalStyle({
            name: path,
            hex: item.hex,
          });

          item.styleId = style.sharedColorStyle.id;
          i++;
        }

        return item;
      });

    palette.libraryData = new Data(palette).makeLibraryData(
      ["style_id"],
      palette.libraryData
    );

    Settings.setLayerSettingForKey(Page, "ui_color_palettes", currentPalettes);

    if (i > 1)
      return locales
        .get()
        .info.createdLocalStyles.plural.replace("{count}", i.toString());
    else if (i === 1) return locales.get().info.createdLocalStyles.single;
    else return locales.get().info.createdLocalStyles.none;
  });

  return createdLocalStylesStatusMessage;
};

export default createLocalStyles
