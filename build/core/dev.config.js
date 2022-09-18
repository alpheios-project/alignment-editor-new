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

const path = require('path')
const projectRoot = process.cwd()

const devConfig = {
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: 'alpheios-alignment-editor.js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style/style-alignment-editor.css'
    })
  ],
  devServer: {
    static: {
      directory: path.resolve(projectRoot, 'public'),
    },
    compress: true,
    port: 9000
  }
}


module.exports = merge(common, devConfig)
