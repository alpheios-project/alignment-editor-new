import App from '@/_output/vue/app.vue'
import Vue from '@vue-runtime'
import VModal from 'vue-js-modal'

export default class AppController {
  constructor (fullData) {
    Vue.use(VModal)
    const rootVi = new Vue({ data: { fullData } })
    const mountEl = document.getElementById('alpheios-alignment-editor-output')
    const AppComponent = Vue.extend(App)

    this._viAppComp = new AppComponent({
      parent: rootVi
    })

    this._viAppComp.$mount(mountEl)
  }
}
