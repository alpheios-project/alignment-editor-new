'use strict'

const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin')
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin')

const sass = require('sass')

const webpack = require('webpack')

const path = require('path')
const projectRoot = process.cwd()

module.exports = {
  mode: 'production',
  entry: {
    ['quick-text']: './src/_pages/quick-text/index.js',
    ['whats-new']: './src/_pages/whats-new/index.js',
  },
  output: {
    library: 'AlignmentEditorPages',
    libraryTarget: 'window',
    path: path.join(projectRoot, 'public/dist/pages'),
    filename: 'alpheios-alignment-editor-[name].min.js'
  },
  resolve: {
    alias: {
      '@': path.join(projectRoot, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]'
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: sass,
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          'vue-loader',
          {
            loader: 'vue-svg-loader', // `vue-svg` for webpack 1.x
            options: {
              // optional [svgo](https://github.com/svg/svgo) options
              svgo: {
                plugins: [
                  {removeDoctype: true},
                  {removeComments: true},
                  {inlineStyles: false}
                ]
              }
            }
          }
        ]

        
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'style/style-alignment-editor-[name].min.css'
    })
  ]
}