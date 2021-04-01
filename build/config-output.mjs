import VueLoaderPlugin from 'vue-loader/lib/plugin.js'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

import path from 'path'
const projectRoot = process.cwd()

const webpack = {
  common: {
    entry: './_output/index.js',
    output: {
      library: 'AlignmentEditorOutput',
      libraryTarget: 'window',
      chunkFilename: 'alignment-editor-output.[name].js',
      path: path.join(projectRoot, 'public/dist/output/')
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
