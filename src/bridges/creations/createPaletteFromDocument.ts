import { uid } from "uid/single";
import { FullConfiguration } from "@a_ng_d/utils-ui-color-palette";
import processSelection from "../processSelection";
import Settings from "sketch/settings";
import Dom from "sketch/dom";
import { getWebContents } from "../../utils/webContents";

const createPaletteFromDocument = async () => {
  const Document = Dom.getSelectedDocument();
  const Page = Document.selectedPage;

  const currentPalettes: Array<FullConfiguration> =
    Settings.layerSettingForKey(Page, "ui_color_palettes") ?? [];
  const document = Document.selectedLayers.layers[0];
  const backup = Settings.documentSettingForKey(
    document,
    "backup"
  ) as FullConfiguration;

  const now = new Date().toISOString();
  delete (backup as Partial<FullConfiguration>).libraryData;
  backup.meta.id = uid();
  backup.meta.dates.openedAt = now;
  backup.meta.dates.createdAt = now;
  backup.meta.dates.updatedAt = now;
  backup.meta.publicationStatus.isPublished = false;
  backup.meta.publicationStatus.isShared = false;
  backup.meta.creatorIdentity.creatorId = "";
  backup.meta.creatorIdentity.creatorFullName = "";
  backup.meta.creatorIdentity.creatorAvatar = "";

  Settings.setLayerSettingForKey(document, "id", backup.meta.id);
  Settings.setLayerSettingForKey(document, "createdAt", now);
  Settings.setLayerSettingForKey(document, "updatedAt", now);

  currentPalettes.push(backup);
  Settings.setLayerSettingForKey(Page, "ui_color_palettes", currentPalettes);

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "LOAD_PALETTE",
      data: backup,
    })})`
  );

  processSelection(getWebContents());

  return backup;
};

export default createPaletteFromDocument;
