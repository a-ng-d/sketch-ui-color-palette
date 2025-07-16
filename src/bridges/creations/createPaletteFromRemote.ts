import {
  BaseConfiguration,
  Data,
  FullConfiguration,
  MetaConfiguration,
  ThemeConfiguration,
} from "@a_ng_d/utils-ui-color-palette";
import { locales } from "../../../resources/content/locales";
import Settings from "sketch/settings";
import Dom from "sketch/dom";
import { getWebContents } from "../../utils/webContents";

interface Msg {
  data: {
    base: BaseConfiguration;
    themes: Array<ThemeConfiguration>;
    meta: MetaConfiguration;
  };
}

const createPaletteFromRemote = async (msg: Msg) => {
  const Document = Dom.getSelectedDocument();
  const Page = Document.selectedPage;

  const currentPalettes: Array<FullConfiguration> =
    Settings.layerSettingForKey(Page, "ui_color_palettes") ?? [];
  const localPalette = currentPalettes.find(
    (palette) => palette.meta.id === msg.data.meta.id
  );

  if (localPalette !== undefined)
    throw new Error(locales.get().info.addToLocal);

  const palette = new Data({
    base: {
      name: msg.data.base.name,
      description: msg.data.base.description,
      preset: msg.data.base.preset,
      shift: msg.data.base.shift,
      areSourceColorsLocked: msg.data.base.areSourceColorsLocked,
      colors: msg.data.base.colors,
      colorSpace: msg.data.base.colorSpace,
      algorithmVersion: msg.data.base.algorithmVersion,
    },
    themes: msg.data.themes,
    meta: {
      id: msg.data.meta.id,
      dates: {
        createdAt: msg.data.meta.dates.createdAt,
        updatedAt: msg.data.meta.dates.updatedAt,
        publishedAt: msg.data.meta.dates.publishedAt,
        openedAt: new Date().toISOString(),
      },
      creatorIdentity: {
        creatorId: msg.data.meta.creatorIdentity.creatorId,
        creatorFullName: msg.data.meta.creatorIdentity.creatorFullName,
        creatorAvatar: msg.data.meta.creatorIdentity.creatorAvatar,
      },
      publicationStatus: {
        isShared: msg.data.meta.publicationStatus.isShared,
        isPublished: msg.data.meta.publicationStatus.isPublished,
      },
    },
  }).makePaletteFullData();

  currentPalettes.push(palette);
  Settings.setLayerSettingForKey(Page, "ui_color_palettes", currentPalettes);

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "LOAD_PALETTE",
      data: palette,
    })})`
  );

  return palette;
};

export default createPaletteFromRemote
