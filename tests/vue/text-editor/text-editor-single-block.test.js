/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import { LocalStorageArea, Options } from 'alpheios-data-models'

import TextEditorSingleBlock from '@/vue/text-editor/text-editor-single-block.vue'

import AppController from '@/lib/controllers/app-controller.js'
import LangsList from '@/lib/data/langs/langs-list.json'
import Vue from '@vue-runtime'

import TokenizeOptionsBlock from '@/vue/text-editor/tokenize-options-block.vue'
import DirectionOptionsBlock from '@/vue/text-editor/direction-options-block.vue'
import LanguageOptionsBlock from '@/vue/text-editor/language-options-block.vue'

import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)

let appC

describe('text-editor-single-block.test.js', () => {
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
    appC.defineHistoryController(appC.store)

    appC.textC.createAlignment()
    appC.historyC.startTracking(appC.textC.alignment)

    appC.settingsC.options.app.items.tokenizer.currentValue = 'simpleLocalTokenizer'
  })

  it('1 TextEditorSingleBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
        store: appC.store,
        localVue,
        propsData: {
          textType: 'target',
          textId: 'targetId'
        }
      })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 TextEditorSingleBlock - textareaId, removeId has textType and textId in value', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
        store: appC.store,
        localVue,
        propsData: {
          textType: 'target',
          textId: 'targetIdTest'
        }
      })
    expect(cmp.vm.textareaId).toEqual(expect.stringContaining('target'))
    expect(cmp.vm.textareaId).toEqual(expect.stringContaining('targetIdTest'))

    expect(cmp.vm.removeId).toEqual(expect.stringContaining('target'))
    expect(cmp.vm.removeId).toEqual(expect.stringContaining('targetIdTest'))
  })

  it('3 TextEditorSingleBlock - has the following blocks with options - DirectionOptionsBlock, LanguageOptionsBlock, TokenizeOptionsBlock', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
        store: appC.store,
        localVue,
        propsData: {
          textType: 'target',
          textId: 'targetIdTest'
        }
      })

    expect(cmp.findComponent(DirectionOptionsBlock)).toBeTruthy()
    expect(cmp.findComponent(LanguageOptionsBlock)).toBeTruthy()
    expect(cmp.findComponent(TokenizeOptionsBlock)).toBeTruthy()
  })

  it('4 TextEditorSingleBlock - localTextEditorOptions prepares a local instance of options', async () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
        store: appC.store,
        localVue,
        propsData: {
          textType: 'target',
          textId: 'targetIdTest'
        }
      })

    expect(cmp.vm.localTextEditorOptions).toEqual({ ready: false })
    await cmp.vm.prepareDefaultTextEditorOptions()

    expect(cmp.vm.localTextEditorOptions).toEqual({ ready: true, sourceText: expect.any(Options)})

    // at the start these options equal to default values
    expect(cmp.vm.direction).toEqual('ltr')
    expect(cmp.vm.language).toEqual('eng')
    expect(cmp.vm.sourceType).toEqual('text')
  })

  
  it('5 TextEditorSingleBlock - textTypeFormatted, textBlockTitle uses textType', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
        store: appC.store,
        localVue,      
        propsData: {
          textType: 'target',
          textId: 'targetIdTest'
        }
      })
    expect(cmp.vm.textTypeFormatted).toEqual('Target')
    expect(cmp.vm.textBlockTitle).toEqual(expect.stringContaining('Target'))
  })

  it('6 TextEditorSingleBlock - if we have multiple target texts then showIndex, showDeleteIcon = true, indexData is equal to target order', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      store: appC.store,
      localVue,
      propsData: {
        textType: 'target',
        textId: 'targetIdTest',
        index: 0 // the first target
      }
    })

    // add origin doc source
    cmp.vm.$textC.updateOriginDocSource({
      text: 'Humano capiti cervicem pictor equinam'
    })

    // add the first target doc source
    cmp.vm.$textC.updateTargetDocSource({
      text: 'Human head neck painter equinam',
      lang: 'lat'
    })

    // we have only one target
    expect(cmp.vm.showIndex).toBeFalsy() 
    expect(cmp.vm.showDeleteIcon).toBeFalsy() 
    expect(cmp.vm.indexData).toEqual('') 

    cmp.vm.$textC.updateTargetDocSource({
      text: 'join if you choose, and the various to bring the feathers,',
      lang: 'lat'
    })

    // we have only two targets

    expect(cmp.vm.showIndex).toBeTruthy() 
    expect(cmp.vm.showDeleteIcon).toBeTruthy() 
    expect(cmp.vm.indexData).toEqual('1. ') 
  })


  it('7 TextEditorSingleBlock - updateText uses $textC updateOriginDocSource or updateTargetDocSource (depends on textType prop)', async () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      store: appC.store,
      localVue,
      propsData: {
        textType: 'origin',
        textId: 'originIdTest'
      }
    })

    cmp.vm.text = 'some origin text'

    await cmp.vm.prepareDefaultTextEditorOptions()
    expect(cmp.vm.direction).toEqual('ltr')
    expect(cmp.vm.language).toEqual('eng')
    expect(cmp.vm.sourceType).toEqual('text')

    jest.spyOn(cmp.vm.$textC, 'updateOriginDocSource')
    jest.spyOn(cmp.vm.$textC, 'updateTargetDocSource')


    cmp.vm.updateText()

    expect(cmp.vm.$textC.updateOriginDocSource).toHaveBeenCalledWith({
      text: 'some origin text',
      direction: 'ltr',
      lang: 'eng',
      sourceType: 'text',
      id: 'originIdTest',
      tokenization: {
        tokenizer: 'simpleLocalTokenizer'
      }
    }, 'originIdTest')

  })

  it('8 TextEditorSingleBlock - uploads data from $textC when it is updated (with uploadCheck)', async () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      store: appC.store,
      localVue,
      propsData: {
        textType: 'origin',
        textId: 'originIdTest'
      }
    })

    await cmp.vm.prepareDefaultTextEditorOptions()

    expect(cmp.vm.text).toBeNull()
    expect(cmp.vm.direction).toEqual('ltr')
    expect(cmp.vm.language).toEqual('eng')
    expect(cmp.vm.sourceType).toEqual('text')

    cmp.vm.$textC.updateOriginDocSource({
      text: 'Humano capiti cervicem pictor equinam',
      direction: 'rtl',
      lang: 'grc'
    })
    appC.store.commit('incrementUploadCheck')

    await Vue.nextTick()

    expect(cmp.vm.text).toEqual('Humano capiti cervicem pictor equinam')
    expect(cmp.vm.direction).toEqual('rtl')
    expect(cmp.vm.language).toEqual('grc')
    expect(cmp.vm.sourceType).toEqual('text')

  })

  it('9 TextEditorSingleBlock - deleteText uses $textC.deleteText to remove target', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      store: appC.store,
      localVue,
      propsData: {
        textType: 'target',
        textId: 'targetIdTest1'
      }
    })

    jest.spyOn(cmp.vm.$textC, 'deleteText')

    cmp.vm.deleteText()

    expect(cmp.vm.$textC.deleteText).toHaveBeenCalledWith('target', 'targetIdTest1')
  })

})

