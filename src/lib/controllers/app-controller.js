import App from '@/vue/app.vue'
import Vue from '@vue-runtime'
import Vuex from 'vuex'

import TextsController from '@/lib/controllers/texts-controller.js'
import AlignedController from '@/lib/controllers/aligned-controller.js'
import HistoryController from '@/lib/controllers/history-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'

import StoreDefinition from '@/lib/store/store-definition'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

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
  constructor ({ appId } = {}) {
    if (!appId) {
      console.error('You should define id inside AppController initialization to start the application.')
      return
    }
    this.pageSettings = {
      appId
    }
  }

  /**
   * Executes methods for initialization and attaching components to the current HTML layout with defined properties
   */
  async init () {
    this.defineStore()
    await this.defineSettingsController()

    if (this.settingsC.themeOptionValue) {
      this.defineColorTheme({ theme: this.settingsC.themeOptionValue, themesList: [] })
    }
    if (this.pageSettings.appId) {
      this.attachVueComponents()
    }

    SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.sub(this.defineColorTheme.bind(this))
    SettingsController.evt.SETTINGS_CONTROLLER_TOKENIZER_DATA_UPDATED.sub(this.updateTokenizerData.bind(this))
  }

  /**
   *
   * @param {String} theme - theme name
   */
  defineColorTheme ({ theme, themesList }) {
    themesList.forEach(themeItem => {
      document.documentElement.classList.remove(`alpheios-${themeItem}`)
      document.body.classList.remove(`alpheios-${themeItem}`)
    })

    document.documentElement.classList.add(`alpheios-${theme}`)
    document.body.classList.add(`alpheios-${theme}`)
  }

  /**
   * Creates and attaches App Vue component, defines additional controllers
   */
  attachVueComponents () {
    this.defineL10Support()
    this.defineNotificationSupport()

    this.defineTextController()
    this.defineAlignedController()
    this.defineHistoryController()

    const rootVi = new Vue({ store: this.store })
    const mountEl = document.getElementById(this.pageSettings.appId)
    const appContainer = document.createElement('div')

    const appContainerEl = mountEl.appendChild(appContainer)
    const AppComponent = Vue.extend(App)

    this._viAppComp = new AppComponent({
      parent: rootVi
    })

    this._viAppComp.$mount(appContainerEl)
  }

  /**
   * Inits Vuex Store
   */
  defineStore () {
    Vue.use(Vuex)
    this.store = new Vuex.Store(StoreDefinition.defaultDefinition)
  }

  /**
   * Creates SettingsController and attaches to Vue components
   */
  async defineSettingsController () {
    this.settingsC = new SettingsController(this.store)
    await this.settingsC.init()

    Vue.prototype.$settingsC = this.settingsC
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
    this.updateTokenizerData(this.settingsC.tokenizeOptionsValues)
    Vue.prototype.$alignedC = this.alignedC
  }

  /**
   *
   * @param {Object} tokenizeParams - params from application settings
   *         {String} tokenizer - tokenizer name
   *         {String} segments - parameter for remote service
   */
  updateTokenizerData (tokenizeOptionsValues) {
    this.alignedC.updateTokenizerData(tokenizeOptionsValues)
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

  /**
   * Defines NotificatinSingleton instance
   */
  defineNotificationSupport () {
    const notificationSingleton = new NotificationSingleton(this.store)
    return notificationSingleton
  }
}
