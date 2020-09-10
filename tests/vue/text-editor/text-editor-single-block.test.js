/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import TextEditorSingleBlock from '@/vue/text-editor/text-editor-single-block.vue'

import AppController from '@/lib/controllers/app-controller.js'
import LangsList from '@/lib/data/langs/langs-list.json'
import Vue from '@vue-runtime'

describe('text-editor.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
    
  beforeAll(() => {
    const appC = new AppController({
      appidWord:'alpheios-alignment-editor'
    })
        
    appC.defineL10Support()
    appC.defineTextController()
    appC.defineAlignedController()
    appC.defineHistoryController()
  })
    
  beforeEach(() => {
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })
  
  it('1 TextEditorSingleBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
        propsData: {
          textId: 'origin'
        }
      })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 TextEditorSingleBlock - textareaId has textId in value', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
        propsData: {
          textId: 'origin'
        }
      })
    expect(cmp.vm.textareaId).toEqual(expect.stringContaining('origin'))
  })

  it('3 TextEditorSingleBlock - textIdFormatted extracts textType from textId', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
        propsData: {
          textId: 'origin'
        }
      })
    expect(cmp.vm.textIdFormatted).toEqual('Origin')
  })

  it('4 TextEditorSingleBlock - textBlockTitle, chooseAvaLangLabel contains textType', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
        propsData: {
          textId: 'origin'
        }
      })
    expect(cmp.vm.textBlockTitle).toEqual(expect.stringContaining('Origin'))
    expect(cmp.vm.chooseAvaLangLabel).toEqual(expect.stringContaining('Origin'))
  })

  it('5 TextEditorSingleBlock - selectedLang defines language for the text', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      propsData: {
        textId: 'origin'
      }
    })

    expect(cmp.vm.selectedLang).toEqual(cmp.vm.selectedAvaLang) // by default
    cmp.vm.selectedOtherLang = 'some-lang'
    expect(cmp.vm.selectedLang).toEqual('some-lang') // custom lang
  })

  it('6 TextEditorSingleBlock - directionRadioId contains textType and direction', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
        propsData: {
          textId: 'origin'
        }
      })
    expect(cmp.vm.directionRadioId('ltr')).toEqual(expect.stringContaining('origin__ltr'))
  })

  it('7 TextEditorSingleBlock - updateAvaLang clears custom input with language', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      propsData: {
        textId: 'origin'
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
      propsData: {
        textId: 'origin'
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

  it('8 TextEditorSingleBlock - updateText emits an event - update-text', () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      propsData: {
        textId: 'origin'
      }
    })

    cmp.vm.text = 'some origin text'
    cmp.vm.updateText()

    expect(cmp.emitted()['update-text']).toBeTruthy()
    expect(cmp.emitted()['update-text'][0]).toEqual([{
      text: 'some origin text', direction: 'ltr', lang: LangsList[0].value
    }])
  })

  it('9 TextEditorSingleBlock - uploads data from externalText when it is updated', async () => {
    let cmp = shallowMount(TextEditorSingleBlock,{
      propsData: {
        textId: 'origin'
      }
    })
    expect(cmp.vm.text).toBeNull()
    expect(cmp.vm.direction).toEqual('ltr')
    expect(cmp.vm.selectedLang).toEqual(LangsList[0].value)

    cmp.setProps({
      externalText: {
        text: 'some origin text', direction: 'rtl', lang: 'grc'
      }
    })

    await Vue.nextTick()

    expect(cmp.vm.text).toEqual('some origin text')
    expect(cmp.vm.direction).toEqual('rtl')
    expect(cmp.vm.selectedLang).toEqual('grc')
  })
})
