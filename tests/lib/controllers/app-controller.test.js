/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import TextsController from '@/lib/controllers/texts-controller.js'
import AlignedGroupsController from '@/lib/controllers/aligned-groups-controller.js'
import HistoryController from '@/lib/controllers/history-controller.js'
import Vue from '@vue-runtime'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import Vuex from 'vuex'

describe('app-controller.test.js', () => {

  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  beforeAll(() => {
    const divEl = document.createElement('div')
    divEl.id = 'alpheios-alignment-editor'
    document.body.appendChild(divEl)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')

    Vue.prototype.$textC = undefined
    Vue.prototype.$alignedGC = undefined
    Vue.prototype.$historyC = undefined
  })

  function timeout (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }


  it('1 AppController - creates AppController and uploads appId from parameters', () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    expect(appC).toHaveProperty('pageSettings', { appId: 'alpheios-alignment-editor' })
  })

  it('2 AppController - print an error to console if appId is not passed via parameters', () => {
    const appC = new AppController({})

    expect(console.error).toHaveBeenLastCalledWith('You should define id inside AppController initialization to start the application.')
  })

  it('3 AppController - init method executes attachVueComponents only if appId is defined', async () => {
    const appC_correct = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    appC_correct.attachVueComponents = jest.fn()
    await appC_correct.init()

    expect(appC_correct.attachVueComponents).toHaveBeenCalled()

    const appC_incorrect = new AppController({})
  
    appC_incorrect.attachVueComponents = jest.fn()
    await appC_incorrect.init()
    expect(appC_incorrect.attachVueComponents).not.toHaveBeenCalled()
  })

  it('4 AppController - init method executes defineStore, defineL10Support, defineNotificationSupport, defineSettingsController and attachVueComponents', async () => {
    const appC_correct = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    jest.spyOn(appC_correct, 'defineStore')
    jest.spyOn(appC_correct, 'defineL10Support')
    jest.spyOn(appC_correct, 'defineNotificationSupport')
    jest.spyOn(appC_correct, 'defineSettingsController')

    appC_correct.attachVueComponents = jest.fn()
    await appC_correct.init()

    expect(appC_correct.defineStore).toHaveBeenCalled()
    expect(appC_correct.defineL10Support).toHaveBeenCalled()
    expect(appC_correct.defineNotificationSupport).toHaveBeenCalled()
    expect(appC_correct.defineSettingsController).toHaveBeenCalled()
    expect(appC_correct.attachVueComponents).toHaveBeenCalled()

    const appC_incorrect = new AppController({})
  
    appC_incorrect.attachVueComponents = jest.fn()
    await appC_incorrect.init()
    expect(appC_incorrect.attachVueComponents).not.toHaveBeenCalled()
  })


  it('5 AppController - init method executes defineColorTheme if settings are uploaded', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    jest.spyOn(appC, 'defineColorTheme')

    await appC.init()
    expect(appC.defineColorTheme).toHaveBeenLastCalledWith({
      theme: appC.settingsC.themeOptionValue, 
      themesList: []
    })
  })

  it('6 AppController - attachVueComponents executes defineTextController, defineAlignedGroupsController, defineHistoryController and attaches App Vue component ', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    jest.spyOn(appC, 'defineTextController')
    jest.spyOn(appC, 'defineAlignedGroupsController')
    jest.spyOn(appC, 'defineHistoryController')

    await appC.init()

    expect(appC.defineTextController).toHaveBeenCalled()
    expect(appC.defineAlignedGroupsController).toHaveBeenCalled()
    expect(appC.defineHistoryController).toHaveBeenCalled()

    const divAppVue = document.getElementById('alpheios-alignment-app-container')   
    expect(divAppVue).toBeDefined()
  })

  it('7 AppController - defineColorTheme method applies theme setting to the HTML layout', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    document.documentElement.classList.add('alpheios-test-theme2')
    document.body.classList.add('alpheios-test-theme2')

    appC.defineColorTheme({
      theme: 'test-theme1',
      themesList: ['test-theme1', 'test-theme2']
    })

    expect(document.documentElement.classList.contains('alpheios-test-theme1')).toBeTruthy()
    expect(document.documentElement.classList.contains('alpheios-test-theme2')).toBeFalsy()

    expect(document.body.classList.contains('alpheios-test-theme1')).toBeTruthy()
    expect(document.body.classList.contains('alpheios-test-theme2')).toBeFalsy()

  })


  it('8 AppController - defineTextController creates TextController and attaches it to Vue component ', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    appC.attachVueComponents = jest.fn()
    await appC.init()

    expect(appC.textC).not.toBeDefined()
    expect(Vue.prototype.$textC).not.toBeDefined()

    appC.defineTextController()

    expect(appC.textC).toBeInstanceOf(TextsController)
    expect(Vue.prototype.$textC).toBeInstanceOf(TextsController)
  })

  it('9 AppController - defineAlignedGroupsController creates AlignedGroupsController and attaches it to Vue component ', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    appC.attachVueComponents = jest.fn()
    await appC.init()

    expect(appC.alignedGC).not.toBeDefined()
    expect(Vue.prototype.$alignedGC).not.toBeDefined()

    appC.defineAlignedGroupsController()

    expect(appC.alignedGC).toBeInstanceOf(AlignedGroupsController)
    expect(Vue.prototype.$alignedGC).toBeInstanceOf(AlignedGroupsController)
  })

  it('10 AppController - defineL10Support creates L10nSingleton ', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    const result = appC.defineL10Support()

    expect(result).toBeInstanceOf(L10nSingleton)
  })

  it('11 AppController - defineStore creates Vuex.Store ', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    expect(appC.store).not.toBeDefined()

    appC.defineStore()

    expect(appC.store).toEqual(expect.any(Vuex.Store))
  })

  it('12 AppController - defineHistoryController creates HistoryController and attaches it to Vue component ', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    appC.attachVueComponents = jest.fn()
    await appC.init()

    expect(appC.historyC).not.toBeDefined()
    expect(Vue.prototype.$historyC).not.toBeDefined()

    appC.defineHistoryController()

    expect(appC.historyC).toBeInstanceOf(HistoryController)
    expect(Vue.prototype.$historyC).toBeInstanceOf(HistoryController)
  })

  it('13 AppController - defineNotificationSupport creates notificationSingleton', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    const result = appC.defineNotificationSupport()

    expect(result).toBeInstanceOf(NotificationSingleton)
  })

})
