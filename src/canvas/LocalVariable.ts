import { HexModel } from "@a_ng_d/utils-ui-color-palette";
import FileFormat from "@sketch-hq/sketch-file-format-ts";
import Dom from "sketch/dom";
import Sketch from "sketch";

const Swatch = Sketch.Swatch;
const Document = Dom.getSelectedDocument();

export default class LocalVariable {
  private name: string;
  private hex: HexModel;
  colorVariable: FileFormat.Swatch;

  constructor({ name, hex }: { name: string; hex: HexModel }) {
    this.name = name;
    this.hex = hex;
    this.colorVariable = this.makeVariable();
  }

  makeVariable = () => {
    this.colorVariable = Swatch.from({
      name: this.name,
      color: this.hex,
    });

    Document.swatches.push(this.colorVariable);

    return this.colorVariable;
  };
}
