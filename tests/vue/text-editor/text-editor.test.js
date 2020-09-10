/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import TextEditor from '@/vue/text-editor/text-editor.vue'
import TextEditorSingleBlock from '@/vue/text-editor/text-editor-single-block.vue'

import Alignment from '@/lib/data/alignment'
import AppController from '@/lib/controllers/app-controller.js'
import TextsController from '@/lib/controllers/texts-controller.js'
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

  it('1 TextEditor - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(TextEditor)
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 TextEditor - should contain two TextEditorSingleBlock', () => {
    let cmp = shallowMount(TextEditor)

    expect(cmp.findAllComponents(TextEditorSingleBlock)).toHaveLength(2)
  })

  it('3 TextEditor - alignment should be already created', () => {
    let cmp = shallowMount(TextEditor)

    expect(cmp.vm.$textC).toEqual(expect.any(TextsController))
    expect(cmp.vm.$textC.alignment).toEqual(expect.any(Alignment))
  })

  it('4 TextEditor - showTextsBlocks defines visibiity for text blocks and could be changed using props from parent', async () => {
    let cmp = shallowMount(TextEditor)

    expect(cmp.vm.showTextsBlocks).toBeTruthy()
    expect(cmp.find('#alpheios-text-editor-blocks-container').isVisible()).toBeTruthy()

    cmp.setProps({'hideEditor': 2})
    
    await Vue.nextTick()
    expect(cmp.vm.showTextsBlocks).toBeFalsy()
    expect(cmp.find('#alpheios-text-editor-blocks-container').isVisible()).toBeFalsy()
  })

  it('5 TextEditor - showTextsBlocksLabel has show if blocks are hidden and hide otherwise, using toggleShowTextsBlocks method', () => {
    let cmp = shallowMount(TextEditor)

    expect(cmp.vm.showTextsBlocks).toBeTruthy()
    expect(cmp.vm.showTextsBlocksLabel).toEqual(expect.stringContaining('hide'))

    cmp.vm.toggleShowTextsBlocks()
    expect(cmp.vm.showTextsBlocks).toBeFalsy()
    expect(cmp.vm.showTextsBlocksLabel).toEqual(expect.stringContaining('show'))
  })

  it('6 TextEditor - updatedOrigin, updatedTarget, originText, targetText - controlls updates of source doc from controller', () => {
    let cmp = shallowMount(TextEditor)

    expect(cmp.vm.originText).toEqual({})
    expect(cmp.vm.targetText).toEqual({})

    cmp.vm.$textC.updateOriginDocSource({text: 'test origin text', lang: 'lat', direction: 'ltr'})
    cmp.vm.$textC.updateTargetDocSource({text: 'test target text', lang: 'eng', direction: 'rtl'})

    expect(cmp.vm.originText).toEqual({})
    expect(cmp.vm.targetText).toEqual({})

    cmp.setProps({'originUpdated': 2, 'targetUpdated': 2})

    expect(cmp.vm.originText).toEqual({text: 'test origin text', lang: 'lat', direction: 'ltr', textType: 'origin'})
    expect(cmp.vm.targetText).toEqual({text: 'test target text', lang: 'eng', direction: 'rtl', textType: 'target'})
  })

  it('7 TextEditor - updateOriginText executes updateOriginDocSource from textsController', () => {
    let cmp = shallowMount(TextEditor)
    
    expect(cmp.vm.$textC.originDocSource).toBeNull()
    cmp.vm.updateOriginText({ text: 'test origin text', lang: 'lat', direction: 'ltr' })
    expect(cmp.vm.$textC.originDocSource).toEqual({text: 'test origin text', lang: 'lat', direction: 'ltr', textType: 'origin'})
  })

  it('8 TextEditor - updateTargetText executes updateTargetDocSource from textsController', () => {
    let cmp = shallowMount(TextEditor)
    
    expect(cmp.vm.$textC.targetDocSource).toBeNull()
    cmp.vm.updateOriginText({ text: 'test origin text', lang: 'lat', direction: 'ltr' })
    cmp.vm.updateTargetText({text: 'test target text', lang: 'eng', direction: 'rtl'})
    expect(cmp.vm.$textC.targetDocSource).toEqual({text: 'test target text', lang: 'eng', direction: 'rtl', textType: 'target'})
  })
})
