/*
 * @Author: hahazexia
 */

'use strict';

const path = require('path');
const fs = require('fs');
const util = require('util');
const objToString = Object.prototype.toString;

function WdyrWebpackPlugin(options) {
  // default not enable
  this.options = Object.assign({
    enable: false
  }, options);
}

WdyrWebpackPlugin.prototype.apply = function(compiler) {
  const enable = this.options.enable;
  let injectScriptPath = 'wdyr-webpack-plugin/src/wdyr.js';

  // find default wdyr.js for webpack entry point as first import
  require.main.paths.find(i => {
    const tempPath = path.join(i, 'wdyr-webpack-plugin/src/wdyr.js');
    if (fs.existsSync(i) && fs.existsSync(tempPath)) {
      injectScriptPath = tempPath;
      return true;
    }
    return false;
  });

  // if there are other options, generate a new wdyr.js having these options
  if (enable && Object.keys(this.options).length > 1) {
    let paramsData;
    if (!this.options.notifier && !this.options.getAdditionalOwnerData) {
      paramsData = util.formatWithOptions({compact: false}, this.options);
    } else {
      const notifierStr = this.options.notifier ? this.options.notifier.toString() : '';
      const getAdditionalOwnerDataStr = this.options.getAdditionalOwnerData ? this.options.getAdditionalOwnerData.toString() : '';
      delete this.options.notifier;
      delete this.options.getAdditionalOwnerData;
      paramsData = util.formatWithOptions({compact: false}, this.options);
      paramsData = paramsData.replace(/(.+)(,)?\s*}\s*$/, '$1');
      paramsData = `${paramsData},
        ${notifierStr ? `notifier: ${notifierStr},` : ''}
        ${getAdditionalOwnerDataStr ? `getAdditionalOwnerData: ${getAdditionalOwnerDataStr},` : ''}}`
    }

    const writeFileData = `
      import React from 'react';
      const whyDidYouRender = require('@welldone-software/why-did-you-render');
      whyDidYouRender(React, ${paramsData});`;

    const writeFilePath = path.resolve(injectScriptPath, '../../dist');

    if (!fs.existsSync(writeFilePath)) {
      try {
        fs.mkdirSync(writeFilePath);
        fs.writeFileSync(`${writeFilePath}/wdyr.js`, writeFileData, {encoding: 'utf8'});
        console.log('write wdyr.js successfully');
      } catch(err) {
        console.log(err);
        process.exit(0);
      }
    } else {
      try {
        fs.writeFileSync(`${writeFilePath}/wdyr.js`, writeFileData, {encoding: 'utf8'});
        console.log('write wdyr.js successfully');
      } catch(err) {
        console.log(err);
        process.exit(0);
      }
    }
    injectScriptPath = `${writeFilePath}/wdyr.js`;
  }

  // when entryOption hook invoke，unshift wdyr.js as first import
  const pluginFunc = (local, entry) => {
    if (enable) {
      if (typeof entry === 'string') {
        entry = [injectScriptPath, entry];
      } else if (objToString.call(entry) === '[object Array]') {
        entry.unshift(injectScriptPath);
      } else if (typeof entry === 'object') {
        for (const key in entry) {
          if (typeof entry[key] === 'string') {
            entry[key] = [injectScriptPath, entry[key]];
          } else if (objToString.call(entry[key]) === '[object Array]') {
            entry[key].unshift(injectScriptPath);
          } else if (objToString.call(entry[key]) === '[object Object]') {
            if (entry[key].import && objToString.call(entry[key].import) === '[object Array]') {
              entry[key].import.unshift(injectScriptPath);
            }
          }
        }
      }
    }
  };

  if (compiler.hooks) { // webpack 4.x
    compiler.hooks.entryOption.tap({ name: 'WdyrWebpackPlugin' }, pluginFunc);
  } else {
    compiler.plugin('entry-option', pluginFunc);
  }
};

module.exports = WdyrWebpackPlugin;
