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
  entry: './src/_output/index.js',
  output: {
    library: 'AlignmentEditorOutput',
    libraryTarget: 'window',
    chunkFilename: 'alignment-editor-output.[name].js',
    path: path.join(projectRoot, '/src/_output/_dist/'),
    filename: 'alpheios-alignment-editor-output.js'
  },
  resolve: {
    alias: {
      '@vue-runtime': path.join(projectRoot, '/node_modules/vue/dist/vue.runtime.esm.js'),
      '@vuedraggable': path.join(projectRoot, '/node_modules/vuedraggable/dist/vuedraggable.umd.min.js'),
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
        test: /\.html$/i,
        loader: 'html-loader',
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
      filename: 'style/style-alignment-editor-output.css'
    }),
    new HtmlWebpackPlugin({
      template: path.join(projectRoot, '/src/lib/download/html-temp-no-script.html'),
      filename: 'html-temp-final.html'
    }),
    new HtmlInlineScriptPlugin(),
    new HTMLInlineCSSWebpackPlugin.default()
  ]
}