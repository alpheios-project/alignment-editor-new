/* global BUILD_NAME */
import { version as packageVersion } from '../../../package'
import App from '@/vue/app.vue'
import Vue from '@vue-runtime'
import Vuex from 'vuex'

import TextsController from '@/lib/controllers/texts-controller.js'
import AlignedGroupsController from '@/lib/controllers/aligned-groups-controller.js'
import TokensEditController from '@/lib/controllers/tokens-edit-controller.js'
import HistoryController from '@/lib/controllers/history-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'

import StoreDefinition from '@/lib/store/store-definition'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Locales from '@/locales/locales.js'

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
    this.defineL10Support()
    this.defineNotificationSupport()
    await this.defineSettingsController()

    if (this.settingsC.themeOptionValue) {
      this.defineColorTheme({ theme: this.settingsC.themeOptionValue, themesList: [] })
    }
    if (this.pageSettings && this.pageSettings.appId) {
      this.attachVueComponents()
    }
    // A build name info will be injected by webpack into the BUILD_NAME but need to have a fallback in case it fails
    this.buildName = typeof BUILD_NAME !== 'undefined' ? BUILD_NAME : ''
    this.version = packageVersion
  }

  /**
   *
   * @param {String} theme - theme name
   * @param {Array[String]} themesList - available theme's names
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
    this.defineTextController()
    this.defineAlignedGroupsController()
    this.defineTokensEditController()
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

    this.defineEvents()
  }

  defineEvents () {
    SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.sub(this.defineColorTheme.bind(this))
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

    this.settingsC.uploadRemoteSettings()
  }

  /**
   * Creates TextController and attaches to Vue components
   */
  defineTextController () {
    this.textC = new TextsController(this.store)
    Vue.prototype.$textC = this.textC
  }

  /**
   * Creates AlignedGroupsController and attaches to Vue components
   */
  defineAlignedGroupsController () {
    this.alignedGC = new AlignedGroupsController(this.store)
    Vue.prototype.$alignedGC = this.alignedGC
  }

  /**
   * Creates TokensEditController and attaches to Vue components
   */
  defineTokensEditController () {
    this.tokensEC = new TokensEditController(this.store)
    Vue.prototype.$tokensEC = this.tokensEC
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
      messageBundles: Locales.bundleArr(Locales.predefinedLocales())
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
