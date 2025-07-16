import { HexModel } from "@a_ng_d/utils-ui-color-palette";
import FileFormat from "@sketch-hq/sketch-file-format-ts";
import Dom from "sketch/dom";

const Document = Dom.getSelectedDocument();
const SharedStyle = Dom.SharedStyle;

export default class LocalStyle {
  private name: string;
  private hex: HexModel;
  sharedColorStyle: FileFormat.SharedStyle;

  constructor({ name, hex }: { name: string; hex: HexModel }) {
    this.name = name;
    this.hex = hex;
    this.sharedColorStyle = this.makeSharedColorStyle();
  }

  makeSharedColorStyle = () => {
    this.sharedColorStyle = SharedStyle.fromStyle({
      name: this.name,
      style: {
        fills: [
          {
            color: this.hex,
            fillType: "Color",
          },
        ],
      },
      document: Document,
    });

    return this.sharedColorStyle;
  };
}
