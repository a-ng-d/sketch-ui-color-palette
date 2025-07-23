import { uid } from "uid/single";
import Settings from "sketch/settings";
import Dom from "sketch/dom";
import { FullConfiguration } from "@a_ng_d/utils-ui-color-palette";
import { locales } from "../../../resources/content/locales";

const createPaletteFromDuplication = async (id: string) => {
  const Document = Dom.getSelectedDocument();

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, "ui_color_palettes") ?? [];
  const basePalette = currentPalettes.find((palette) => palette.meta.id === id);
  const now = new Date().toISOString();

  if (basePalette === undefined)
    throw new Error(locales.get().error.unfoundPalette);

  const palette = JSON.parse(JSON.stringify(basePalette)) as FullConfiguration;

  palette.base.name = locales
    .get()
    .browse.copy.replace("{name}", palette.base.name);
  delete (palette as Partial<FullConfiguration>).libraryData;
  palette.meta.id = uid();
  palette.meta.publicationStatus.isPublished = false;
  palette.meta.publicationStatus.isShared = false;
  palette.meta.dates.updatedAt = now;
  palette.meta.dates.createdAt = now;
  palette.meta.dates.publishedAt = "";
  palette.meta.dates.openedAt = now;
  palette.meta.creatorIdentity.creatorId = "";
  palette.meta.creatorIdentity.creatorFullName = "";
  palette.meta.creatorIdentity.creatorAvatar = "";

  currentPalettes.push(palette);
  Settings.setDocumentSettingForKey(
    Document,
    "ui_color_palettes",
    currentPalettes
  );

  return palette;
};

export default createPaletteFromDuplication;
