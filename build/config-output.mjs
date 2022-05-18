import { VueLoaderPlugin } from 'vue-loader'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import HtmlInlineScriptPlugin from 'html-inline-script-webpack-plugin'
import HTMLInlineCSSWebpackPlugin from 'html-inline-css-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'

import path from 'path'
const projectRoot = process.cwd()

const webpack = {
  common: {
    entry: './_output/index.js',
    output: {
      library: 'AlignmentEditorOutput',
      libraryTarget: 'window',
      chunkFilename: 'alignment-editor-output.[name].js',
      path: path.join(projectRoot, '/src/_output/_dist/')
    },
    resolve: {
      alias: {
        '@vue-runtime': path.join(projectRoot, '/node_modules/vue/dist/vue.runtime.esm.js'),
        '@vuedraggable': path.join(projectRoot, '/node_modules/vuedraggable/dist/vuedraggable.umd.min.js'),
        '@': path.join(projectRoot, 'src')
      }
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(projectRoot, '/src/lib/download/html-temp-no-script.html'),
        filename: 'html-temp-final.html'
      }),
      new HtmlInlineScriptPlugin(),
      new HTMLInlineCSSWebpackPlugin.default()
    ],
    module: {
      rules: [
        {
          test: /\.(jpg|png)$/,
          use: [{
            loader: 'url-loader',
            options: {
              limit: 1500
            }
          }]
        }
      ]
    }
  },

  production: {
    mode: 'production',
    output: {
      filename: 'alpheios-alignment-editor-output.min.js'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style/style-alignment-editor-output.min.css'
      })
    ]
  },

  development: {
    mode: 'development',
    output: {
      filename: 'alpheios-alignment-editor-output.js'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style/style-alignment-editor-output.css'
      })
    ]
  }
}

export { webpack }
