/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import DirectionOptionsBlock from '@/vue/text-editor/direction-options-block.vue'
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import SettingsController from '@/lib/controllers/settings-controller'
import VModal from 'vue-js-modal'
import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)

let appC, localTextEditorOptions

describe('direction-options-block.test.js', () => {
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
    SettingsController.create(appC.store)
    await appC.defineSettingsController(appC.store)

    localTextEditorOptions = await SettingsController.cloneTextEditorOptions('target', 0)
    localTextEditorOptions.ready = true
  })

  it('1 DirectionOptionsBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(DirectionOptionsBlock, {
        store: appC.store,
        localVue,
        propsData: {
          localOptions: localTextEditorOptions
        }
      })
    expect(cmp.exists()).toBeTruthy()
  })

  it('2 DirectionOptionsBlock - renders optionItem', () => {
    let cmp = shallowMount(DirectionOptionsBlock, {
      store: appC.store,
      localVue,
      propsData: {
        localOptions: localTextEditorOptions
      }
    })
    
    const optionItem = cmp.find(OptionItemBlock)
    expect(optionItem.isVisible()).toBeTruthy()
  })

  it('3 DirectionOptionsBlock - updateData emits updateText event', () => {
    let cmp = shallowMount(DirectionOptionsBlock, {
        store: appC.store,
        localVue,
        propsData: {
          localOptions: localTextEditorOptions
        }
      })

    cmp.vm.updateData()
    expect(cmp.emitted()['updateText']).toBeTruthy()
  })

})
