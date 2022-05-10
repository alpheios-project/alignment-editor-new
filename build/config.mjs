import { VueLoaderPlugin } from 'vue-loader'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import Dotenv from 'dotenv-webpack'

import path from 'path'
const projectRoot = process.cwd()

const webpack = {
  common: {
    entry: './index.js',
    output: {
      library: 'AlignmentEditor',
      libraryTarget: 'window',
      chunkFilename: 'alignment-editor.[name].js',
      path: path.join(projectRoot, 'public/dist')
    },
    resolve: {
      alias: {
        '@vue-runtime': path.join(projectRoot, '/node_modules/vue/dist/vue.runtime.esm.js'),
        '@vuedraggable': path.join(projectRoot, '/node_modules/vuedraggable/dist/vuedraggable.umd.min.js'),
        '@': path.join(projectRoot, 'src'),
        'alpheios-client-adapters': path.join(projectRoot, '/node_modules/alpheios-core/packages/client-adapters/dist/alpheios-client-adapters.js'),
        'alpheios-data-models': path.join(projectRoot, '/node_modules/alpheios-core/packages/data-models/dist/alpheios-data-models.js'),
        'alpheios-l10n': path.join(projectRoot, '/node_modules/alpheios-core/packages/l10n/dist/alpheios-l10n.js'),
      }
    },
    plugins: [
      new VueLoaderPlugin(),
      new Dotenv()
    ],
    module: {
      rules: [
        {
          test: /\.html$/i,
          loader: 'html-loader',
        }
      ]
    }
  },

  production: {
    mode: 'production',
    output: {
      filename: 'alpheios-alignment-editor.min.js'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style/style-alignment-editor.min.css'
      })
    ]
  },

  development: {
    mode: 'development',
    output: {
      filename: 'alpheios-alignment-editor.js'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style/style-alignment-editor.css'
      })
    ]
  }
}

export { webpack }