import { VueLoaderPlugin } from 'vue-loader'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

import path from 'path'
const projectRoot = process.cwd()

const webpack = {
  common: {
    entry: {
      ['whats-new']: './_pages/whats-new/index.js',
      ['quick-text']: './_pages/quick-text/index.js',
      ['video-tutorials']: './_pages/video-tutorials/index.js'
    },
    output: {
      library: 'AlignmentEditorPages',
      libraryTarget: 'window',
      path: path.join(projectRoot, 'public/dist/pages')
    },
    resolve: {
      alias: {
        '@vue-runtime': path.join(projectRoot, '/node_modules/vue/dist/vue.runtime.esm.js'),
        '@': path.join(projectRoot, 'src'),
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
      filename: 'alpheios-alignment-editor-[name].min.js'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style/style-alignment-editor-[name].min.css'
      })
    ]
  },

  development: {
    mode: 'development',
    output: {
      filename: 'alpheios-alignment-editor-[name].js'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style/style-alignment-editor-[name].css'
      })
    ]
  }
}

export { webpack }