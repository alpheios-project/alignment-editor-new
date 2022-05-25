/* eslint-env jest */
/* eslint-disable no-unused-vars */
import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import NotificationBar from '@/vue/notification-bar.vue'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import Vue from '@vue-runtime'
import VModal from 'vue-js-modal'
import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)

let appC

describe('notification-bar.test.js', () => {
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
    appC.defineAlignedGroupsController(appC.store)
    appC.defineTokensEditController(appC.store)
    appC.defineHistoryAlGroupsController(appC.store)
  })

  it('1 NotificationBar - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(NotificationBar, { 
      store: appC.store,
      localVue 
    })
    expect(cmp.exists()).toBeTruthy()
  })

  it('2 NotificationBar - messages from store are published to the bar', async () => {
    let cmp = shallowMount(NotificationBar, { 
      store: appC.store,
      localVue 
    })
    
    expect(cmp.vm.messages).toEqual([])

    // a new message is added
    NotificationSingleton.addNotification({
      text: 'Test message 1',
      type: NotificationSingleton.types.ERROR
    })

    await Vue.nextTick()
    expect(cmp.vm.messages).toEqual([{
      text: 'Test message 1',
      type: NotificationSingleton.types.ERROR
    }])

    expect(cmp.vm.notificationClass(cmp.vm.messages[0])).toEqual({ 'alpheios-alignment-notification-bar-message___error': true })

    // ths message was removed
    cmp.vm.hideMessage(cmp.vm.messages[0])

    await Vue.nextTick()
    expect(cmp.vm.messages).toEqual([])
  })
})

