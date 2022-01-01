# wdyr-webpack-plugin

![wdyr-webpack-plugin](https://img.shields.io/npm/v/wdyr-webpack-plugin?style=flat-square)

webpack plugin for [why-did-you-render](https://github.com/welldone-software/why-did-you-render)

## usage

### Install

```bash
# by npm
$ npm install wdyr-webpack-plugin
# by yarn
$ yarn add wdyr-webpack-plugin
```

### enable whyDidYouRender

```js
// webpack.config.js
const WdyrWebpackPlugin = require('wdyr-webpack-plugin');

module.exports = {
  plugins: [
    new WdyrWebpackPlugin({
      enable: process.env.NODE_ENV === 'development',
      // other options
    })
  ]
}
```

You can checkout the fully config options from [why-did-you-render#options](https://github.com/welldone-software/why-did-you-render#options).

