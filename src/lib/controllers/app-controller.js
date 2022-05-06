import App from '@/vue/app.vue'
import Vue from '@vue-runtime'

import Vuex from 'vuex'

import TextsController from '@/lib/controllers/texts-controller.js'
import AlignedGroupsController from '@/lib/controllers/aligned-groups-controller.js'
import TokensEditController from '@/lib/controllers/tokens-edit-controller.js'
import HistoryAlGroupsController from '@/lib/controllers/history-algroups-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'
import StorageController from '@/lib/controllers/storage-controller.js'
import AnnotationsController from '@/lib/controllers/annotations-controller.js'

import StoreDefinition from '@/lib/store/store-definition'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Locales from '@/locales/locales.js'
import VModal from 'vue-js-modal'

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
    this.defineStorageController()

    await this.defineSettingsController()

    if (SettingsController.themeOptionValue) {
      this.defineColorTheme({ theme: SettingsController.themeOptionValue, themesList: [] })
    }
    if (this.pageSettings && this.pageSettings.appId) {
      this.attachVueComponents()
    }

    this.defineClassReadingTools({ value: SettingsController.enableAlpheiosReadingTools })
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

  defineClassReadingTools ({ value }) {
    const hideClassName = 'alpehios-hide-readding-tools-toolbar'
    if (!value) {
      document.documentElement.classList.add(hideClassName)
      document.body.classList.add(hideClassName)
    } else {
      document.documentElement.classList.remove(hideClassName)
      document.body.classList.remove(hideClassName)
    }
  }

  /**
   * Creates and attaches App Vue component, defines additional controllers
   */
  attachVueComponents () {
    Vue.use(VModal)

    this.defineTextController()
    this.defineAlignedGroupsController()
    this.defineTokensEditController()
    this.defineHistoryAlGroupsController()
    this.defineAnnotationsController()

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
    SettingsController.evt.SETTINGS_CONTROLLER_READING_TOOLS_CLASS_UPDATED.sub(this.defineClassReadingTools.bind(this))
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
    await SettingsController.init(this.store)

    const result = await SettingsController.uploadRemoteSettings()

    if (!result) {
      SettingsController.downgradeToOfflineTokenizer()
    }
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
   * Creates HistoryAlGroupsController and attaches to Vue components
   */
  defineHistoryAlGroupsController () {
    this.historyAGC = new HistoryAlGroupsController(this.store)
    Vue.prototype.$historyAGC = this.historyAGC
  }

  defineAnnotationsController () {
    this.annotationsC = new AnnotationsController(this.store)
    Vue.prototype.$annotationsC = this.annotationsC
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

  defineStorageController () {
    StorageController.definedDBAdapter()
  }
}
