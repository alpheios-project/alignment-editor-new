/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import OptionsBlock from '@/vue/options/options-block.vue'
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import VModal from 'vue-js-modal'
import Vuex from "vuex"
import SettingsController from '@/lib/controllers/settings-controller'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)

let appC, localTextEditorOptions

describe('options-block.test.js', () => {
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

    await appC.defineSettingsController(appC.store)
    SettingsController.allOptions.app.items.tokenizer.currentValue = 'alpheiosRemoteTokenizer'
  })

  it('1 OptionsBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(OptionsBlock, {
        store: appC.store,
        localVue,
        propsData: {
          localOptions: localTextEditorOptions
        }
      })
    expect(cmp.exists()).toBeTruthy()
  })

  it.skip('2 OptionsBlock - renders optionItem', () => {
    let cmp = shallowMount(OptionsBlock, {
      store: appC.store,
      localVue,
      propsData: {
        localOptions: localTextEditorOptions
      }
    })
    
    const optionItems = cmp.findAll(OptionItemBlock)
    expect(optionItems.length).toEqual(22)
  })
})