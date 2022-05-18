import App from '@/_pages/video-tutorials/vue/app.vue'
import Vue from '@vue-runtime'

export default class AppController {
  constructor ({ appId }) {
    const rootVi = new Vue({})
    const mountEl = document.getElementById(appId)
    const AppComponent = Vue.extend(App)

    this._viAppComp = new AppComponent({
      parent: rootVi
    })

    this._viAppComp.$mount(mountEl)
  }
}
