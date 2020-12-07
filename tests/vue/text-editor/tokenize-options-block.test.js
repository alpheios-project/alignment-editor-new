/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import TokenizeOptionsBlock from '@/vue/text-editor/tokenize-options-block.vue'
import OptionItemBlock from '@/vue/options/option-item-block.vue'

import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)

let appC, localTextEditorOptions

describe('tokenize-options-block.test.js', () => {
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
    await appC.settingsC.init()
    await appC.settingsC.uploadRemoteSettings()

    appC.settingsC.options.app.items.tokenizer.currentValue = 'alpheiosRemoteTokenizer'

    localTextEditorOptions = await appC.settingsC.cloneTextEditorOptions('target', 0)
    localTextEditorOptions.ready = true
  })

  it('1 TokenizeOptionsBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(TokenizeOptionsBlock, {
        store: appC.store,
        localVue,
        propsData: {
          localOptions: localTextEditorOptions
        }
      })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 TokenizeOptionsBlock - renders optionItem', () => {
    let cmp = shallowMount(TokenizeOptionsBlock, {
      store: appC.store,
      localVue,
      propsData: {
        localOptions: localTextEditorOptions
      }
    })
    
    const optionItems = cmp.findAll(OptionItemBlock)
    expect(optionItems.length).toEqual(1 + Object.keys(localTextEditorOptions.text.items).length + Object.keys(localTextEditorOptions.tei.items).length)
  })

  it('3 TokenizeOptionsBlock - updateData emits updateText event', () => {
    let cmp = shallowMount(TokenizeOptionsBlock, {
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