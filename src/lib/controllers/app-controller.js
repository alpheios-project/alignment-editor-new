import App from '@/vue/app.vue'
import Vue from '@vue-runtime'

import TextsController from '@/lib/controllers/texts-controller.js'

import L10n from '@/lib/l10n/l10n.js'
import Locales from '@/locales/locales.js'
import EnUsCommon from '@/locales/en-us/messages-common.json'
import EnUsTextEditor from '@/locales/en-us/messages-text-editor.json'
import EnUsAlignEditor from '@/locales/en-us/messages-align-editor.json'
import EnUsMainMenu from '@/locales/en-us/messages-main-menu.json'
import enGB from '@/locales/en-gb/messages.json'

export default class AppController {
  constructor ({ appId }) {
    this.attachVueComponents(appId)
  }

  attachVueComponents (appId) {
    this.defineL10Support()
    this.defineTextController(this.l10n)

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

  defineTextController (l10n) {
    this.textC = new TextsController(l10n)
    Vue.prototype.$textC = this.textC
  }

  defineL10Support () {
    const config = {
      defaultLocale: Locales.en_US,
      messageBundles: Locales.bundleArr([
        [EnUsCommon, Locales.en_US],
        [EnUsTextEditor, Locales.en_US],
        [EnUsMainMenu, Locales.en_US],
        [EnUsAlignEditor, Locales.en_US],
        [enGB, Locales.en_GB]
      ])
    }
    this.l10n = new L10n()
    config.messageBundles.forEach(mb => this.l10n.addMessageBundle(mb))
    this.l10n.setLocale(config.defaultLocale)

    Vue.prototype.$l10n = this.l10n
  }
}
