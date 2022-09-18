import App from '@/_output/vue/app.vue'
import { createApp } from 'vue'

import ModalPlugin from '@/plugins/modal'
import SourceData from '@/_output/data/source-data.js'

export default class AppController {
  constructor (fullData) {
    const app = createApp(App)
    app.provide('$fullData', new SourceData(fullData))

    app.use(ModalPlugin)

    app.mount('#alpheios-alignment-editor-output') 
  }
}
