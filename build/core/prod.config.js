'use strict'

const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Dotenv = require('dotenv-webpack')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const sass = require('sass')

const webpack = require('webpack')
const { merge } = require('webpack-merge')

const common = require('./common.config.js')

const TERSER_OPTIONS = {
  terserOptions: {
    ecma: 8,
    warnings: false,
    parse: {},
    compress: {},
    mangle: true, // Note `mangle.properties` is `false` by default.
    module: false,
    output: null,
    toplevel: false,
    nameCache: null,
    ie8: false,
    keep_classnames: true, // Without this class names will not be comparable with strings
    /*
    Without below it will be not possible to bundle minified files because of
    "TypeError: Super expression must either be null or a function, not undefined" error.
    Please see https://github.com/airbnb/react-dates/issues/1456 for more details.
     */
    keep_fnames: true,
    safari10: false
  }
}

const prodConfig = {
    mode: 'production',
    optimization: {
      minimizer: [
        new TerserPlugin(TERSER_OPTIONS),
        new CssMinimizerPlugin()
      ]
    },
    output: {
      filename: 'alpheios-alignment-editor.min.js'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style/style-alignment-editor.min.css'
      })
    ]
  }
  
  module.exports = merge(common, prodConfig)