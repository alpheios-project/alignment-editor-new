/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import TextEditor from '@/vue/text-editor/text-editor.vue'
import TextEditorSingleBlock from '@/vue/text-editor/text-editor-single-block.vue'

import Alignment from '@/lib/data/alignment'
import AppController from '@/lib/controllers/app-controller.js'
import TextsController from '@/lib/controllers/texts-controller.js'
import Vue from '@vue-runtime'

import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)

let appC

describe('text-editor.test.js', () => {
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
    appC.defineTokensEditController(appC.store)
    appC.defineHistoryController(appC.store)
  })

  it('1 TextEditor - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(TextEditor, { 
      store: appC.store,
      localVue 
    })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 TextEditor - should contain two TextEditorSingleBlock', () => {
    let cmp = shallowMount(TextEditor, { 
      store: appC.store,
      localVue 
    })

    expect(cmp.findAllComponents(TextEditorSingleBlock)).toHaveLength(2)
  })

  it('3 TextEditor - alignment should be already created', () => {
    let cmp = shallowMount(TextEditor, { 
      store: appC.store,
      localVue 
    })

    expect(cmp.vm.$textC).toEqual(expect.any(TextsController))
    expect(cmp.vm.$textC.alignment).toEqual(expect.any(Alignment))
    expect(cmp.vm.$historyC.alignment).toEqual(expect.any(Alignment))
  })

  it('4 TextEditor - showTextsBlocks defines visibiity for text blocks and could be changed using props from parent', async () => {
    let cmp = shallowMount(TextEditor, { 
      store: appC.store,
      localVue 
    })

    expect(cmp.vm.showTextsBlocks).toBeTruthy()
    expect(cmp.find('#alpheios-text-editor-blocks-container').isVisible()).toBeTruthy()

    cmp.setProps({'hideEditor': 2})
    
    await Vue.nextTick()
    expect(cmp.vm.showTextsBlocks).toBeFalsy()
    expect(cmp.find('#alpheios-text-editor-blocks-container').isVisible()).toBeFalsy()
  })

  it('5 TextEditor - showTextsBlocksLabel has show if blocks are hidden and hide otherwise, using toggleShowTextsBlocks method', () => {
    let cmp = shallowMount(TextEditor, { 
      store: appC.store,
      localVue 
    })

    expect(cmp.vm.showTextsBlocks).toBeTruthy()
    expect(cmp.vm.showTextsBlocksLabel).toEqual(expect.stringContaining('hide'))

    cmp.vm.toggleShowTextsBlocks()
    expect(cmp.vm.showTextsBlocks).toBeFalsy()
    expect(cmp.vm.showTextsBlocksLabel).toEqual(expect.stringContaining('show'))
  })


})
