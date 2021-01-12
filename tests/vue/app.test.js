/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import App from '@/vue/app.vue'
import MainMenu from '@/vue/main-menu.vue'
import TextEditor from '@/vue/text-editor/text-editor.vue'
import AlignEditor from '@/vue/align-editor/align-editor.vue'

import TextsController from '@/lib/controllers/texts-controller.js'
import AppController from '@/lib/controllers/app-controller.js'
import AlignedGroupsController from '@/lib/controllers/aligned-groups-controller.js'
import HistoryController from '@/lib/controllers/history-controller.js'

import NotificationSingleton from '@/lib/notifications/notification-singleton'

import Alignment from '@/lib/data/alignment'
import SourceText from '@/lib/data/source-text'

import OptionsBlock from '@/vue/options/options-block.vue'
import Vue from '@vue-runtime'

import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)

let appC

describe('app.test.js', () => {
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
    appC.defineHistoryController(appC.store)
  })

  it('1 App - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(App)
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 App - should contain MainMenu, TextEditor, AlignEditor', () => {
    let cmp = shallowMount(App)
    expect(cmp.findComponent(MainMenu)).toBeTruthy()
    expect(cmp.findComponent(OptionsBlock)).toBeTruthy()
    expect(cmp.findComponent(TextEditor)).toBeTruthy()
    expect(cmp.findComponent(AlignEditor)).toBeTruthy()
  })

  it('3 App - downloadData - executes textC.downloadData', () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.$textC).toEqual(expect.any(TextsController))
    jest.spyOn(cmp.vm.$textC, 'downloadData')
    
    cmp.vm.downloadData()
    expect(cmp.vm.$textC.downloadData).toHaveBeenCalled()
  })

  it('4 App - uploadData - executes textC.uploadDocSourceFromFileAll, updateOriginTextEditor, updateTargetTextEditor', () => {
    let cmp = shallowMount(App)

    jest.spyOn(cmp.vm.$textC, 'uploadDocSourceFromFileAll')
    
    cmp.vm.uploadData('test data')
    expect(cmp.vm.$textC.uploadDocSourceFromFileAll).toHaveBeenCalledWith('test data', 'alpheiosRemoteTokenizer')
  })

  it('5 App - alignTexts - executes $alignedGC.createAlignedTexts, and if successfull - hideTextEditorM, showAlignEditorM', async () => {
    let cmp = shallowMount(App)
    expect(cmp.vm.$alignedGC).toEqual(expect.any(AlignedGroupsController))

    cmp.vm.$alignedGC.createAlignedTexts = jest.fn(() => true)
    
    expect(cmp.vm.hideTextEditor).toEqual(1)
    expect(cmp.vm.showAlignEditor).toEqual(1)

    await cmp.vm.alignTexts()
    expect(cmp.vm.$alignedGC.createAlignedTexts).toHaveBeenCalled()
    expect(cmp.vm.hideTextEditor).toEqual(2)
    expect(cmp.vm.showAlignEditor).toEqual(2)
  })

  it('6 App - alignTexts - alignTexts - executes $alignedGC.createAlignedTexts, and if failed - no other methods', () => {
    let cmp = shallowMount(App)
    expect(cmp.vm.$alignedGC).toEqual(expect.any(AlignedGroupsController))

    cmp.vm.$alignedGC.createAlignedTexts = jest.fn(() => false)
    
    expect(cmp.vm.hideTextEditor).toEqual(1)
    expect(cmp.vm.showAlignEditor).toEqual(1)

    cmp.vm.alignTexts()
    expect(cmp.vm.$alignedGC.createAlignedTexts).toHaveBeenCalled()
    expect(cmp.vm.hideTextEditor).toEqual(1)
    expect(cmp.vm.showAlignEditor).toEqual(1)
  })


  it('7 App - undoAction - executes $historyC.undo', () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.$historyC).toEqual(expect.any(HistoryController))
    cmp.vm.$historyC.undo = jest.fn()
    
    cmp.vm.undoAction()
    expect(cmp.vm.$historyC.undo).toHaveBeenCalled()
  })

  it('8 App - redoAction - executes $historyC.redo', () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.$historyC).toEqual(expect.any(HistoryController))
    cmp.vm.$historyC.redo = jest.fn()
    
    cmp.vm.redoAction()
    expect(cmp.vm.$historyC.redo).toHaveBeenCalled()
  })

  it('9 App - addTarget - executes $textC.updateTargetDocSource', () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.$textC).toEqual(expect.any(TextsController))
    cmp.vm.$textC.updateTargetDocSource = jest.fn()
    
    cmp.vm.addTarget()
    expect(cmp.vm.$textC.updateTargetDocSource).toHaveBeenCalled()
  })

  it('10 App - alignEditorAvailable - updates visibility status for text and align editors', async () => {
    let cmp = shallowMount(App, { 
      store: appC.store,
      localVue 
    })
    
    expect(cmp.vm.$store.state.alignmentUpdated).toEqual(1)
    expect(cmp.vm.$alignedGC.alignmentGroupsWorkflowStarted).toBeFalsy()
    expect(cmp.vm.alignEditorAvailable).toBeFalsy() // alignment workflow didn't start

    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource2 = new SourceText('target', {
      text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment(originDocSource, targetDocSource1)
    alignment.updateTargetDocSource(targetDocSource2)
    await cmp.vm.$alignedGC.createAlignedTexts(alignment)
    
    expect(cmp.vm.$store.state.alignmentUpdated).toEqual(2)

    expect(cmp.vm.$alignedGC.alignmentGroupsWorkflowStarted).toBeTruthy()
    expect(cmp.vm.alignEditorAvailable).toBeTruthy() // alignment workflow started
    
  })

  it('11 App - toggleOptions - shows/hide options block', async () => {
    let cmp = shallowMount(App, { 
      store: appC.store,
      localVue 
    })

    expect(cmp.vm.shownOptionsBlock).toBeFalsy()
    expect(cmp.findComponent(OptionsBlock).isVisible()).toBeFalsy()

    cmp.vm.toggleOptions()

    await Vue.nextTick()

    expect(cmp.vm.shownOptionsBlock).toBeTruthy()
    expect(cmp.findComponent(OptionsBlock).isVisible()).toBeTruthy()
  })

  it('12 App - startOver - starts alignment process from the beginning', async () => {
    let cmp = shallowMount(App, { 
      store: appC.store,
      localVue 
    })
    // start alignment normally
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource2 = new SourceText('target', {
      text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment(originDocSource, targetDocSource1)
    alignment.updateTargetDocSource(targetDocSource2)
    await cmp.vm.$alignedGC.createAlignedTexts(alignment)

    // decided to start over
    jest.spyOn(cmp.vm.$textC, 'startOver')
    jest.spyOn(cmp.vm.$alignedGC, 'startOver')
    jest.spyOn(cmp.vm.$historyC, 'startOver')
    jest.spyOn(NotificationSingleton, 'clearNotifications')

    cmp.vm.startOver()

    expect(cmp.vm.$textC.startOver).toHaveBeenCalled()
    expect(cmp.vm.$alignedGC.startOver).toHaveBeenCalled()
    expect(cmp.vm.$historyC.startOver).toHaveBeenCalled()
    expect(NotificationSingleton.clearNotifications).toHaveBeenCalled()

  })
})


