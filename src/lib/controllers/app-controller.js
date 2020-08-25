import App from '@/vue/app.vue'
import Vue from '@vue-runtime'

import TextsController from '@/lib/controllers/texts-controller.js'
import AlignedController from '@/lib/controllers/aligned-controller.js'

import L10n from '@/lib/l10n/l10n.js'
import Locales from '@/locales/locales.js'
import EnUsCommon from '@/locales/en-us/messages-common.json'
import EnUsLanguages from '@/locales/en-us/messages-languages.json'
import EnUsTextEditor from '@/locales/en-us/messages-text-editor.json'
import EnUsAlignEditor from '@/locales/en-us/messages-align-editor.json'
import EnUsMainMenu from '@/locales/en-us/messages-main-menu.json'
import enGB from '@/locales/en-gb/messages.json'

export default class AppController {
  /**
   *
   * @param {String} appId - id attribute of the HTML element where Vue application should be attached
   */
  constructor ({ appId }) {
    if (!appId) {
      console.error('You should define id inside AppController initialization to start the application.')
      return
    }
    this.appId = appId
  }

  /**
   * Executes methods for initialization and attaching components to the current HTML layout with defined properties
   */
  init () {
    if (this.appId) {
      this.attachVueComponents()
    }
  }

  /**
   * Creates and attaches App Vue component, defines additional controllers
   */
  attachVueComponents () {
    this.defineL10Support()
    this.defineTextController(this.l10n)
    this.defineAlignedController(this.l10n)

    const rootVi = new Vue()
    const mountEl = document.getElementById(this.appId)
    const appContainer = document.createElement('div')

    const appContainerEl = mountEl.appendChild(appContainer)
    const AppComponent = Vue.extend(App)

    this._viAppComp = new AppComponent({
      parent: rootVi
    })

    this._viAppComp.$mount(appContainerEl)
  }

  /**
   * Creates TextController and attaches to Vue components
   * @param {L10n} l10n - initialized L10n module
   */
  defineTextController (l10n) {
    this.textC = new TextsController(l10n)
    Vue.prototype.$textC = this.textC
  }

  /**
   * Creates AlignedController and attaches to Vue components
   * @param {L10n} l10n - initialized L10n module
   */
  defineAlignedController (l10n) {
    this.alignedC = new AlignedController(l10n)
    Vue.prototype.$alignedC = this.alignedC
  }

  /**
   * Defines L10n module and attaches to Vue components
   * @param {L10n} l10n - initialized L10n module
   */
  defineL10Support () {
    const config = {
      defaultLocale: Locales.en_US,
      messageBundles: Locales.bundleArr([
        [EnUsCommon, Locales.en_US],
        [EnUsLanguages, Locales.en_US],
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
