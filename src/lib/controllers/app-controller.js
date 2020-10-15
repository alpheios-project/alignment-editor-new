import App from '@/vue/app.vue'
import Vue from '@vue-runtime'
import Vuex from 'vuex'

import TextsController from '@/lib/controllers/texts-controller.js'
import AlignedController from '@/lib/controllers/aligned-controller.js'
import HistoryController from '@/lib/controllers/history-controller.js'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
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
  constructor ({ appId, theme } = {}) {
    if (!appId) {
      console.error('You should define id inside AppController initialization to start the application.')
      return
    }
    this.appId = appId
    this.theme = this.defineThemeFromUrl(theme)
  }

  /**
   * Registered themes in scss
   * @returns {Array[String]}
   */
  get availableThemes () {
    return ['standard-theme', 'v1-theme']
  }

  /**
   * @returns {String} - the name of the default theme
   */
  get defaultTheme () {
    return this.availableThemes[0]
  }

  /**
   * Defines final theme according to the following priority:
   * 1. A theme is defined in url GET parameters - theme
   * 2. A theme is defined in application code - theme
   * 3. A default theme
   * @param {String} theme - passed from the application initialization code
   */
  defineThemeFromUrl (theme) {
    const params = window.location.search
      .substring(1)
      .split('&')
      .map(v => v.split('='))
      .reduce((map, [key, value]) => map.set(key, decodeURIComponent(value)), new Map())

    const themeFromUrl = params.get('theme')
    if (themeFromUrl && this.availableThemes.includes(themeFromUrl)) {
      return themeFromUrl
    } else if (theme && this.availableThemes.includes(theme)) {
      return theme
    }
    return this.defaultTheme
  }

  /**
   * Executes methods for initialization and attaching components to the current HTML layout with defined properties
   */
  init () {
    if (this.theme) {
      this.defineColorTheme()
    }
    if (this.appId) {
      this.attachVueComponents()
    }
  }

  defineColorTheme () {
    document.documentElement.classList.add(`alpheios-${this.theme}`)
    document.body.classList.add(`alpheios-${this.theme}`)
  }

  /**
   * Creates and attaches App Vue component, defines additional controllers
   */
  attachVueComponents () {
    this.defineStore()

    this.defineL10Support()
    this.defineTextController()
    this.defineAlignedController()
    this.defineHistoryController()

    const rootVi = new Vue({ store: this.store })
    const mountEl = document.getElementById(this.appId)
    const appContainer = document.createElement('div')

    const appContainerEl = mountEl.appendChild(appContainer)
    const AppComponent = Vue.extend(App)

    this._viAppComp = new AppComponent({
      parent: rootVi
    })

    this._viAppComp.$mount(appContainerEl)
  }

  defineStore () {
    Vue.use(Vuex)
    this.store = new Vuex.Store({
      state: {
        alignmentUpdated: 1
      },
      mutations: {
        incrementAlignmentUpdated (state) {
          state.alignmentUpdated++
        }
      }
    })
  }

  /**
   * Creates TextController and attaches to Vue components
   */
  defineTextController () {
    this.textC = new TextsController(this.store)
    Vue.prototype.$textC = this.textC
  }

  /**
   * Creates AlignedController and attaches to Vue components
   */
  defineAlignedController () {
    this.alignedC = new AlignedController(this.store)
    Vue.prototype.$alignedC = this.alignedC
  }

  /**
   * Creates HistoryController and attaches to Vue components
   */
  defineHistoryController () {
    this.historyC = new HistoryController(this.store)
    Vue.prototype.$historyC = this.historyC
  }

  /**
   * Defines L10n module
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

    const l10n = new L10nSingleton()
    config.messageBundles.forEach(mb => l10n.addMessageBundle(mb))
    l10n.setLocale(config.defaultLocale)
    return l10n
  }
}
