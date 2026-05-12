const postcss = require('postcss')

const platformPattern = /\[data-(?:theme|mode)=["']?[^\]"']*["']?\]/
const whitelistPattern =
  /\[data-theme=["']?sketch["']?\]|\[data-mode=["']?sketch-(?:light|dark)["']?\]/

const filterCssSelectorsPlugin = (root) => {
  root.walkRules((rule) => {
    if (
      platformPattern.test(rule.selector) &&
      !whitelistPattern.test(rule.selector)
    )
      rule.remove()
  })
}

module.exports = function (source) {
  const callback = this.async()

  postcss([filterCssSelectorsPlugin])
    .process(source, { from: this.resourcePath })
    .then((result) => callback(null, result.css))
    .catch((err) => callback(err))
}
