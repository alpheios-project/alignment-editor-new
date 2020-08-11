import App from '@/vue/app.vue'
import Vue from '@vue-runtime'
import TextsController from '@/lib/controllers/texts-controller.js'

export default class AppController {
  constructor ({ appId }) {
    this.attachVueComponents(appId)
  }

  attachVueComponents (appId) {
    const textCInstance = new TextsController()

    Vue.prototype.$textC = textCInstance

    const rootVi = new Vue()
    const mountEl = document.getElementById(appId)
    const appContainer = document.createElement('div')

    const appContainerEl = mountEl.appendChild(appContainer)
    const AppComponent = Vue.extend(App)

    this._viAppComp = new AppComponent({
      parent: rootVi
    })

    this._viAppComp.$mount(appContainerEl)
  }
}
