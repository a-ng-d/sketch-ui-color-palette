import Settings from 'sketch/settings'
import Dom from 'sketch/dom'
import {
  Data,
  FullConfiguration,
  ViewConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../../resources/content/locales'
//import Documents from "../../canvas/Documents";

const createDocument = async (id: string, view: ViewConfiguration) => {
  /*const Document = Dom.getSelectedDocument();
  const Page = Document.selectedPage;

  const currentPalettes: Array<FullConfiguration> =
    Settings.documentSettingForKey(Document, "ui_color_palettes") ?? [];

  const palette = currentPalettes.find((palette) => palette.meta.id === id);

  if (palette === undefined)
    throw new Error(locales.get().error.unfoundPalette);

  const documents = new Documents({
    base: palette.base,
    themes: palette.themes,
    data: new Data(palette).makePaletteData(),
    meta: palette.meta,
    view: view,
  });

  Page.layers.push(...documents.documents);

  //Document.selectedLayer.push(...documents.documents);
  Document.centerOnLayer(documents.documents[0]);

  return palette;*/
}

export default createDocument
