/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import MainMenu from '@/vue/main-menu.vue'
import AppController from '@/lib/controllers/app-controller.js'
import Vue from '@vue-runtime'

import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)

let appC

describe('main-menu.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  beforeEach(async () => {
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')

    appC = new AppController({
      appId:'alpheios-alignment-editor'
    })
    
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)

    await appC.defineSettingsController()
    appC.defineTextController(appC.store)
    appC.defineAlignedController(appC.store)
    appC.defineHistoryController(appC.store)
  })

  it('1 MainMenu - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(MainMenu, { 
      store: appC.store,
      localVue 
    })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 App - should contain buttons - download, upload, align and hidden upload block', () => {
    let cmp = shallowMount(MainMenu, { 
      store: appC.store,
      localVue 
    })

    
    expect(cmp.find('#alpheios-main-menu-options')).toBeTruthy()
    expect(cmp.find('#alpheios-main-menu-add-target')).toBeTruthy()
    expect(cmp.find('#alpheios-main-menu-download')).toBeTruthy()
    expect(cmp.find('#alpheios-main-menu-upload')).toBeTruthy()
    expect(cmp.find('#alpheios-main-menu-align')).toBeTruthy()
    expect(cmp.find('#alpheios-main-menu-upload-block')).toBeTruthy()
    expect(cmp.find('#alpheios-main-menu-upload-block').isVisible()).toBeFalsy()
  })

  it('3 MainMenu - uploadTexts shows upload block', async () => {
    let cmp = shallowMount(MainMenu, { 
      store: appC.store,
      localVue 
    })
    const uploadBlock = cmp.find('#alpheios-main-menu-upload-block')
    
    expect(uploadBlock.isVisible()).toBeFalsy()
    cmp.vm.uploadTexts()

    await Vue.nextTick()
    expect(uploadBlock.isVisible()).toBeTruthy()
  })
})

