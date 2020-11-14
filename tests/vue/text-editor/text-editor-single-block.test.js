/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import TextEditorSingleBlock from '@/vue/text-editor/text-editor-single-block.vue'

import AppController from '@/lib/controllers/app-controller.js'
import LangsList from '@/lib/data/langs/langs-list.json'
import Vue from '@vue-runtime'

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
    await appC.defineSettingsController()
    
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
    appC.defineTextController(appC.store)
    appC.defineAlignedController(appC.store)
    appC.defineHistoryController(appC.store)

    appC.textC.createAlignment()
    appC.historyC.startTracking(appC.textC.alignment)
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

  it('3 TextEditorSingleBlock - textTypeFormatted, textBlockTitle, chooseAvaLangLabel uses textType', () => {
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
    expect(cmp.vm.chooseAvaLangLabel).toEqual(expect.stringContaining('Target'))
  })

  it('4 TextEditorSingleBlock - selectedLang defines language for the text', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      store: appC.store,
      localVue,
      propsData: {
        textType: 'target',
        textId: 'targetIdTest'
      }
    })

    expect(cmp.vm.selectedLang).toEqual(cmp.vm.selectedAvaLang) // by default
    cmp.vm.selectedOtherLang = 'some-lang'
    expect(cmp.vm.selectedLang).toEqual('some-lang') // custom lang
  })

  it('5 TextEditorSingleBlock - if we have multiple target texts then showIndex, showDeleteIcon = true, indexData is equal to target order', () => {
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

  it('6 TextEditorSingleBlock - directionRadioId contains textType and direction', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
        store: appC.store,
        localVue,
        propsData: {
          textType: 'target',
          textId: 'targetIdTest'
        }
      })
    expect(cmp.vm.directionRadioId('ltr')).toEqual(expect.stringContaining('target__ltr'))
  })

  it('7 TextEditorSingleBlock - updateAvaLang clears custom input with language', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      store: appC.store,
      localVue,
      propsData: {
        textType: 'target',
        textId: 'targetIdTest'
      }
    })
    expect(cmp.vm.selectedOtherLang).toBeNull()

    cmp.vm.selectedOtherLang = 'some-lang'
    expect(cmp.vm.selectedLang).toEqual('some-lang') // custom lang

    cmp.vm.updateAvaLang()

    expect(cmp.vm.selectedOtherLang).toBeNull()
  })

  it('8 TextEditorSingleBlock - updateLang updates lang from external source', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      store: appC.store,
      localVue,
      propsData: {
        textType: 'target',
        textId: 'targetIdTest'
      }
    })

    cmp.vm.updateLang('grc')
    expect(cmp.vm.selectedOtherLang).toBeNull()
    expect(cmp.vm.selectedAvaLang).toEqual('grc')

    cmp.vm.updateLang('grc-test')
    expect(cmp.vm.selectedOtherLang).toEqual('grc-test')
    expect(cmp.vm.selectedAvaLang).toEqual(LangsList[0].value)

    cmp.vm.updateLang('ara')
    expect(cmp.vm.selectedOtherLang).toBeNull()
    expect(cmp.vm.selectedAvaLang).toEqual('ara')
  })

  it('8 TextEditorSingleBlock - updateText uses $textC updateOriginDocSource or updateTargetDocSource (depends on textType prop)', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      store: appC.store,
      localVue,
      propsData: {
        textType: 'origin',
        textId: 'originIdTest'
      }
    })

    cmp.vm.text = 'some origin text'

    jest.spyOn(cmp.vm.$textC, 'updateOriginDocSource')
    jest.spyOn(cmp.vm.$textC, 'updateTargetDocSource')

    cmp.vm.updateText()

    expect(cmp.vm.$textC.updateOriginDocSource).toHaveBeenCalledWith({
      text: 'some origin text',
      direction: 'ltr',
      lang: LangsList[0].value,
      id: 'originIdTest'
    })
  })

  it('9 TextEditorSingleBlock - uploads data from $textC when it is updated (with alignmentUpdated)', async () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      store: appC.store,
      localVue,
      propsData: {
        textType: 'origin',
        textId: 'originIdTest'
      }
    })
    expect(cmp.vm.text).toBeNull()
    expect(cmp.vm.direction).toEqual('ltr')
    expect(cmp.vm.selectedLang).toEqual(LangsList[0].value)

    cmp.vm.$textC.updateOriginDocSource({
      text: 'Humano capiti cervicem pictor equinam',
      direction: 'rtl',
      lang: 'grc'
    })

    await Vue.nextTick()

    expect(cmp.vm.text).toEqual('Humano capiti cervicem pictor equinam')
    expect(cmp.vm.direction).toEqual('rtl')
    expect(cmp.vm.selectedLang).toEqual('grc')
  })

  it('10 TextEditorSingleBlock - deleteText uses $textC.deleteText to remove target', () => {
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

