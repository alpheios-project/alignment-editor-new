import { createApp } from 'vue'
import { createStore } from 'vuex'

import appVue from '@/vue/app.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Locales from '@/locales/locales.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import StoreDefinition from '@/lib/store/store-definition'

import TextsController from '@/lib/controllers/texts-controller.js'
import AlignedGroupsController from '@/lib/controllers/aligned-groups-controller.js'
import TokensEditController from '@/lib/controllers/tokens-edit-controller.js'
import HistoryAlGroupsController from '@/lib/controllers/history-algroups-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'
import StorageController from '@/lib/controllers/storage-controller.js'
import AnnotationsController from '@/lib/controllers/annotations-controller.js'

import ModalPlugin from '@/plugins/modal'

export default class AppController {
  constructor ({ appId } = {}) {
    if (!appId) {
      console.error('You should define id inside AppController initialization to start the application.')
      return
    }
    this.pageSettings = {
      appId
    }
  }

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

  defineStore () {
    this.store = createStore(StoreDefinition.defaultDefinition)
  }

  attachVueComponents () {
    this.app = createApp(appVue)

    this.defineTextController()
    this.defineAlignedGroupsController()
    this.defineTokensEditController()
    this.defineHistoryAlGroupsController()
    this.defineAnnotationsController()

    this.app.use(this.store)
    this.app.use(ModalPlugin)
    this.app.mount(`#${this.pageSettings.appId}`) 

    this.defineEvents()

  }

  defineEvents () {
    SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.sub(this.defineColorTheme.bind(this))
    SettingsController.evt.SETTINGS_CONTROLLER_READING_TOOLS_CLASS_UPDATED.sub(this.defineClassReadingTools.bind(this))
  }
  
  /**
   * Creates TextController and attaches to Vue components
   */
  defineTextController () {
    this.textC = new TextsController(this.store)
    if (this.app) {
      this.app.provide('$textC', this.textC)
    }
  }

  /**
   * Creates AlignedGroupsController and attaches to Vue components
   */
  defineAlignedGroupsController () {
    this.alignedGC = new AlignedGroupsController(this.store)
    if (this.app) {
      this.app.provide('$alignedGC', this.alignedGC)
    }
  }

  /**
   * Creates TokensEditController and attaches to Vue components
   */
  defineTokensEditController () {
    this.tokensEC = new TokensEditController(this.store)
    if (this.app) {
      this.app.provide('$tokensEC', this.tokensEC)
    }
  }

  /**
   * Creates HistoryAlGroupsController and attaches to Vue components
   */
   defineHistoryAlGroupsController () {
    this.historyAGC = new HistoryAlGroupsController(this.store)
    if (this.app) {
      this.app.provide('$historyAGC', this.historyAGC)
    }
  }

  defineAnnotationsController () {
    this.annotationsC = new AnnotationsController(this.store)
    if (this.app) {
      this.app.provide('$annotationsC', this.annotationsC)
    }
  }

  async defineSettingsController () {
    await SettingsController.init(this.store)

    const uploaded = await SettingsController.uploadRemoteSettings()
    if (!uploaded) {
      const result = SettingsController.downgradeToOffline()

      if (result) {
        NotificationSingleton.addNotification({
          text: L10nSingleton.getMsgS('APP_CONTROLLER_DOWNGRADE_TO_OFFLINE'),
          type: NotificationSingleton.types.INFO
        })
      }
    } else {
      const result = SettingsController.upgradeToRemote()

      if (result) {
        NotificationSingleton.addNotification({
          text: L10nSingleton.getMsgS('APP_CONTROLLER_UPGRADE_TO_REMOTE'),
          type: NotificationSingleton.types.INFO
        })
      }
    }
  }

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

  defineNotificationSupport () {
    const notificationSingleton = new NotificationSingleton(this.store)
    return notificationSingleton
  }

  defineStorageController () {
    StorageController.definedDBAdapter()
  }
}


