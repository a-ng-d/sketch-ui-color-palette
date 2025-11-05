![GitHub package.json version](https://img.shields.io/github/package-json/v/a-ng-d/sketch-ui-color-palette?color=informational) ![GitHub last commit](https://img.shields.io/github/last-commit/a-ng-d/sketch-ui-color-palette?color=informational) ![GitHub](https://img.shields.io/github/license/a-ng-d/sketch-ui-color-palette?color=informational) ![GitHub actiond](https://img.shields.io/github/actions/workflow/status/a-ng-d/sketch-ui-color-palette/release.yml?label=Download)

# UI Color Palette on Sketch
UI Color Palette is a Sketch plugin that creates consistent and accessible color palettes specifically for UI. The plugin uses alternative color spaces, like `LCH`, `OKLCH`, `CIELAB`, `OKLAB`, and `HSLuv`, to create color shades based on the configured lightness scale. These spaces ensure [WCAG standards](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance and sufficient contrast between information and background color.

The idea to make this Sketch plugin comes from the article: [Accessible Palette: stop using HSL for color systems](https://wildbit.com/blog/accessible-palette-stop-using-hsl-for-color-systems).

This plugin will allow you to:
- Create a complete palette from any existing color to help you build a color scaling (or Primitive colors)
- Manage the color palette in real-time to control the contrast
- Sync the color shades/tints with local styles, variables
- Generate code in various languages
- Publish the palette for reuse across multiple documents or add shared palettes from the community

---

## Installation
- [Download](https://uicp.ylb.lt/run-sketch-plugin) the latest release of the plugin
- Un-zip
- Double-click on `sketch-ui-color-palette.sketchplugin`
- _Enjoy!_

## Documentation
The full documentation can be consulted on [docs.ui-color-palette.com](https://uicp.ylb.lt/docs-sketch-plugin).

---

## Contribution
### Community
Ask questions, submit your ideas or requests on [Canny](https://uicp.ylb.lt/ideas).

### Issues
Have you encountered a bug? Could a feature be improved?
Go to the `Issues` section and browse the existing tickets or create a new one.

### Development
- Clone this repository (or fork it)
- Install dependencies with `npm install`
- Run `npm run start:dev` to watch in development mode
- Run `npm run start:ext` to run the external services such as the workers ansd the auth lobby
- Run `npm run hotreload` to reload Sketch if there is a change
- Go to Sketch, then `Plugins` > `🎨 UI Color Palette`
- Create a `Branch` and open a `Pull Request`
- _Let's do this_

### Debugging

To view the output of your `console.log`, you have a few different options:

- Open `Console.app` and look for the sketch logs
- Look at the `~/Library/Logs/com.bohemiancoding.sketch3/Plugin Output.log` file

Skpm provides a convenient way to do the latter:

```bash
skpm log
```

The `-f` option causes `skpm log` to not stop when the end of logs is reached, but rather to wait for additional data to be appended to the input

---

## Attribution
- The colors are managed thanks to the [chroma.js](https://github.com/gka/chroma.js) library by [Gregor Aisch](https://github.com/gka)
- The APCA algorithm is provided thanks to the [apca-w3](https://www.npmjs.com/package/apca-w3) module by [Andrew Somers](https://github.com/Myndex)
- The color names are provided by [color-name](https://github.com/meodai/color-names) by [meodai](https://github.com/meodai/color-names)

## Support
- [Follow the plugin LinkedIn page](https://uicp.ylb.lt/network)
- [Support the author](https://uicp.ylb.lt/author)
