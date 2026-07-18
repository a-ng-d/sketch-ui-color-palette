import Dom from 'sketch/dom'
import { HexModel } from '@yelbolt/engine-ui-color-palette'
import FileFormat from '@sketch-hq/sketch-file-format-ts'

const Document = Dom.getSelectedDocument()
const SharedStyle = Dom.SharedStyle

export default class LocalStyle {
  private name: string
  private hex: HexModel
  sharedColorStyle: FileFormat.SharedStyle

  constructor({ name, hex }: { name: string; hex: HexModel }) {
    this.name = name
    this.hex = hex
    this.sharedColorStyle = this.makeSharedColorStyle()
  }

  makeSharedColorStyle = () => {
    this.sharedColorStyle = SharedStyle.fromStyle({
      name: this.name,
      style: {
        fills: [
          {
            color: this.hex,
            fillType: 'Color',
          },
        ],
      },
      document: Document,
    })

    return this.sharedColorStyle
  }
}
