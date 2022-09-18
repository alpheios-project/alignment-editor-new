'use strict'

const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Dotenv = require('dotenv-webpack')

const sass = require('sass')

const webpack = require('webpack')

const path = require('path')
const projectRoot = process.cwd()

const common = {
  entry: './src/index.js',
  output: {
    library: 'AlignmentEditor',
    libraryTarget: 'window',
    path: path.resolve(projectRoot, 'public/dist'),
    chunkFilename: 'alignment-editor.[name].js'
  },
  resolve: {
    alias: {
      'vue': '@vue/runtime-dom',
      '@': path.join(projectRoot, 'src'),
      'alpheios-client-adapters': path.join(projectRoot, '/node_modules/alpheios-core/packages/client-adapters/dist/alpheios-client-adapters.min.js'),
      'alpheios-data-models': path.join(projectRoot, '/node_modules/alpheios-core/packages/data-models/dist/alpheios-data-models.min.js'),
      'alpheios-l10n': path.join(projectRoot, '/node_modules/alpheios-core/packages/l10n/dist/alpheios-l10n.min.js')
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
    new Dotenv()
  ]
}

module.exports = common
