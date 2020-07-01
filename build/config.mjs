import VueLoaderPlugin from 'vue-loader/lib/plugin.js'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

import path from 'path'
const projectRoot = process.cwd()

const webpack = {
  common: {
    entry: './index.js',
    output: {
      library: 'AlignmentEditor',
      libraryTarget: 'window',
      chunkFilename: 'alignment-editor.[name].js'
    },
    resolve: {
      alias: {
        '@vue-runtime': path.join(projectRoot, '../../node_modules/vue/dist/vue.runtime.esm.js'),
        '@': path.join(projectRoot, 'src')
      }
    },
    plugins: [
      new VueLoaderPlugin()
    ],
    module: {
      rules: [
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
