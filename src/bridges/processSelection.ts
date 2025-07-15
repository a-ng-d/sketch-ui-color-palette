import chroma from "chroma-js";
import {
  HexModel,
  SourceColorConfiguration,
} from "@a_ng_d/utils-ui-color-palette";
import Dom from "sketch/dom";
import Settings from "sketch/settings";
import { uid } from "uid/single";

const Document = Dom.getSelectedDocument();

export let currentSelection: Array<any> = [];
export let previousSelection: Array<any> = [];
export let isSelectionChanged = false;

const processSelection = (webContents: any) => {
  previousSelection = currentSelection.length === 0 ? [] : currentSelection;
  isSelectionChanged = true;

  const selection: Array<any> = Document.selectedLayers.layers;
  currentSelection = Document.selectedLayers;

  const viableSelection: Array<SourceColorConfiguration> = [];

  const document = selection[0];

  const selectionHandler = (state: string) => {
    const actions: { [key: string]: () => void } = {
      DOCUMENT_SELECTED: async () => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "DOCUMENT_SELECTED",
            data: {
              view: document.getPluginData("view"),
              id: document.getPluginData("id"),
              updatedAt: document.getPluginData("updatedAt"),
              isLinkedToPalette:
                penpot.currentPage?.getPluginData(
                  `palette_${document.getPluginData("id")}`
                ) !== "",
            },
          })})`
        );
      },
      EMPTY_SELECTION: () => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "EMPTY_SELECTION",
          })})`
        );
      },
      COLOR_SELECTED: () => {
        webContents.executeJavaScript(
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
    Settings.layerSettingForKey(document, "type") === "UI_COLOR_PALETTE" &&
    (document.type !== "SymbolMaster" || document.type !== "SymbolInstance")
  )
    selectionHandler("DOCUMENT_SELECTED");
  else if (selection.length === 0) selectionHandler("EMPTY_SELECTION");
  else if (
    document.type !== "SymbolMaster" ||
    document.type !== "SymbolInstance"
  )
    selectionHandler("EMPTY_SELECTION");
  else if (document.style.fills.length === 0)
    selectionHandler("EMPTY_SELECTION");

  selection.forEach((element) => {
    const foundColors = element.style.fills.filter(
      (fill: any) => fill.fillType === "Color"
    );
    if (element.type !== "Group" && element.type !== "Image")
      if (foundColors.length > 0) {
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
        selectionHandler("COLOR_SELECTED");
      }
  });

  setTimeout(() => (isSelectionChanged = false), 1000);
};

export default processSelection;
