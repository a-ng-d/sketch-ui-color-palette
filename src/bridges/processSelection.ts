import chroma from "chroma-js";
import {
  FullConfiguration,
  HexModel,
  SourceColorConfiguration,
} from "@a_ng_d/utils-ui-color-palette";
import Dom from "sketch/dom";
import Settings from "sketch/settings";
import { uid } from "uid/single";
import { getWebContents } from "../utils/webContents";

export let currentSelection: Array<any> = [];
export let previousSelection: Array<any> = [];
export let isSelectionChanged = false;

const processSelection = (webContents?: any) => {
  const Document = Dom.getSelectedDocument();
  const sharedWebContents =
    webContents === undefined ? getWebContents() : webContents;

  previousSelection = currentSelection.length === 0 ? [] : currentSelection;
  isSelectionChanged = true;

  const selection: Array<any> = Document.selectedLayers.layers;
  currentSelection = Document.selectedLayers;

  const viableSelection: Array<SourceColorConfiguration> = [];

  const document = selection[0];

  const selectionHandler = (state: string) => {
    const actions: { [key: string]: () => void } = {
      DOCUMENT_SELECTED: async () => {
        console.log(document);
        const id = Settings.documentSettingForKey(Document, "id");
        const currentPalettes: Array<FullConfiguration> =
          Settings.documentSettingForKey(Document, "ui_color_palettes");
        const palette = currentPalettes.find(
          (palette) => palette.meta.id === id
        );

        sharedWebContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "DOCUMENT_SELECTED",
            data: {
              view: Settings.documentSettingForKey(Document, "view"),
              id: id,
              updatedAt: Settings.documentSettingForKey(Document, "updatedAt"),
              isLinkedToPalette: palette !== undefined,
            },
          })})`
        );
      },
      EMPTY_SELECTION: () => {
        sharedWebContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "EMPTY_SELECTION",
          })})`
        );
      },
      COLOR_SELECTED: () => {
        sharedWebContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "COLOR_SELECTED",
            data: {
              selection: viableSelection,
            },
          })})`
        );
      },
    };

    return actions[state]?.();
  };

  if (
    selection.length === 1 &&
    Settings.documentSettingForKey(Document, "type") === "UI_COLOR_PALETTE" &&
    (document.type !== "SymbolMaster" || document.type !== "SymbolInstance")
  )
    return selectionHandler("DOCUMENT_SELECTED");
  else if (selection.length === 0) selectionHandler("EMPTY_SELECTION");

  selection.forEach((element) => {
    const foundColors = element.style.fills.filter(
      (fill: any) => fill.fillType === "Color"
    );
    if (
      element.type !== "Group" &&
      element.type !== "Image" &&
      element.type !== "SymbolMaster" &&
      element.type !== "SymbolInstance" &&
      foundColors.length > 0
    ) {
      foundColors.forEach((color: any) => {
        const hexToGl = chroma(color.color as HexModel).gl();
        viableSelection.push({
          name: element.name,
          rgb: {
            r: hexToGl[0],
            g: hexToGl[1],
            b: hexToGl[2],
          },
          source: "CANVAS",
          id: uid(),
          isRemovable: false,
          hue: {
            shift: 0,
            isLocked: false,
          },
          chroma: {
            shift: 100,
            isLocked: false,
          },
        });
      });
      return selectionHandler("COLOR_SELECTED");
    }
  });

  setTimeout(() => (isSelectionChanged = false), 1000);
};

export default processSelection;
