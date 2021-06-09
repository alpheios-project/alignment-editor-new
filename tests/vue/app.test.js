/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import App from '@/vue/app.vue'
import MainMenu from '@/vue/main-menu.vue'
import TextEditor from '@/vue/text-editor/text-editor.vue'
import AlignEditor from '@/vue/align-editor/align-editor.vue'
import TokensEditor from '@/vue/tokens-editor/tokens-editor.vue'

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
    appC.defineTokensEditController(appC.store)
    appC.defineHistoryController(appC.store)
  })

  it('1 App - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(App)
    expect(cmp.vm).toBeTruthy()
  })

  it('2 App - should contain MainMenu, TextEditor, AlignEditor', () => {
    let cmp = shallowMount(App)
    expect(cmp.findComponent(MainMenu)).toBeTruthy()
    expect(cmp.findComponent(OptionsBlock)).toBeTruthy()
    expect(cmp.findComponent(TextEditor)).toBeTruthy()
    expect(cmp.findComponent(AlignEditor)).toBeTruthy()
    expect(cmp.findComponent(TokensEditor)).toBeTruthy()
    
  })

  it('3 App - downloadData - executes textC.downloadData', () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.$textC).toEqual(expect.any(TextsController))
    jest.spyOn(cmp.vm.$textC, 'downloadData')
    
    cmp.vm.downloadData('plainSourceDownloadAll')
    expect(cmp.vm.$textC.downloadData).toHaveBeenCalled()
  })

  it('4 App - uploadData - executes textC.uploadDocSourceFromFileAll, updateOriginTextEditor, updateTargetTextEditor', () => {
    let cmp = shallowMount(App)

    jest.spyOn(cmp.vm.$textC, 'uploadDocSourceFromFileAll')
    
    cmp.vm.uploadData('test data', 'tsv')
    expect(cmp.vm.$textC.uploadDocSourceFromFileAll).toHaveBeenCalledWith('test data', 'alpheiosRemoteTokenizer', 'plainSourceUploadAll')
  })

  it('5 App - alignTexts - alignTexts - executes $alignedGC.createAlignedTexts, and if failed - no other methods', async () => {
    let cmp = shallowMount(App)
    expect(cmp.vm.$alignedGC).toEqual(expect.any(AlignedGroupsController))

    jest.spyOn(cmp.vm, 'showAlignmentGroupsEditor')
    cmp.vm.$alignedGC.createAlignedTexts = jest.fn(() => true)

    cmp.vm.alignTexts()

    await Vue.nextTick()
    expect(cmp.vm.$alignedGC.createAlignedTexts).toHaveBeenCalled()
    expect(cmp.vm.showAlignmentGroupsEditor).toHaveBeenCalled()
  })


  it('6 App - undoAction - executes $historyC.undo', () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.$historyC).toEqual(expect.any(HistoryController))
    cmp.vm.$historyC.undo = jest.fn()
    
    cmp.vm.undoAction()
    expect(cmp.vm.$historyC.undo).toHaveBeenCalled()
  })

  it('7 App - redoAction - executes $historyC.redo', () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.$historyC).toEqual(expect.any(HistoryController))
    cmp.vm.$historyC.redo = jest.fn()
    
    cmp.vm.redoAction()
    expect(cmp.vm.$historyC.redo).toHaveBeenCalled()
  })

  it('8 App - addTarget - executes $textC.updateTargetDocSource', () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.$textC).toEqual(expect.any(TextsController))
    cmp.vm.$textC.addNewTarget = jest.fn()
    jest.spyOn(cmp.vm, 'showSourceTextEditor')
    
    cmp.vm.addTarget()
    expect(cmp.vm.$textC.addNewTarget).toHaveBeenCalled()
    expect(cmp.vm.showSourceTextEditor).toHaveBeenCalled()
  })

  it('9 App - showOptions - sets visible only options block', async () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.shownOptionsBlock).toBeFalsy()
    expect(cmp.vm.showSourceTextEditorBlock).toBeFalsy()
    expect(cmp.vm.showAlignmentGroupsEditorBlock).toBeFalsy()
    expect(cmp.vm.showTokensEditorBlock).toBeFalsy()

    expect(cmp.findComponent(OptionsBlock).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TextEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(AlignEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TokensEditor).isVisible()).toBeFalsy()

    cmp.vm.showOptions()

    await Vue.nextTick()

    expect(cmp.vm.shownOptionsBlock).toBeTruthy()
    expect(cmp.vm.showSourceTextEditorBlock).toBeFalsy()
    expect(cmp.vm.showAlignmentGroupsEditorBlock).toBeFalsy()
    expect(cmp.vm.showTokensEditorBlock).toBeFalsy()

    expect(cmp.findComponent(OptionsBlock).isVisible()).toBeTruthy()
    expect(cmp.findComponent(TextEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(AlignEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TokensEditor).isVisible()).toBeFalsy()
  })

  it('10 App - showSourceTextEditor - sets visible only TextEditor block', async () => {
    let cmp = shallowMount(App)
    cmp.vm.showOptions()

    await Vue.nextTick()

    expect(cmp.vm.shownOptionsBlock).toBeTruthy()
    expect(cmp.vm.showSourceTextEditorBlock).toBeFalsy()
    expect(cmp.vm.showAlignmentGroupsEditorBlock).toBeFalsy()
    expect(cmp.vm.showTokensEditorBlock).toBeFalsy()

    expect(cmp.findComponent(OptionsBlock).isVisible()).toBeTruthy()
    expect(cmp.findComponent(TextEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(AlignEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TokensEditor).isVisible()).toBeFalsy()

    cmp.vm.showSourceTextEditor()

    await Vue.nextTick()

    expect(cmp.vm.shownOptionsBlock).toBeFalsy()
    expect(cmp.vm.showSourceTextEditorBlock).toBeTruthy()
    expect(cmp.vm.showAlignmentGroupsEditorBlock).toBeFalsy()
    expect(cmp.vm.showTokensEditorBlock).toBeFalsy()

    expect(cmp.findComponent(OptionsBlock).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TextEditor).isVisible()).toBeTruthy()
    expect(cmp.findComponent(AlignEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TokensEditor).isVisible()).toBeFalsy()
  })

  it('11 App - showAlignmentGroupsEditor - sets visible only AlignEditor block', async () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.shownOptionsBlock).toBeFalsy()
    expect(cmp.vm.showSourceTextEditorBlock).toBeFalsy()
    expect(cmp.vm.showAlignmentGroupsEditorBlock).toBeFalsy()
    expect(cmp.vm.showTokensEditorBlock).toBeFalsy()

    expect(cmp.findComponent(OptionsBlock).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TextEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(AlignEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TokensEditor).isVisible()).toBeFalsy()

    cmp.vm.showAlignmentGroupsEditor()

    await Vue.nextTick()

    expect(cmp.vm.shownOptionsBlock).toBeFalsy()
    expect(cmp.vm.showSourceTextEditorBlock).toBeFalsy()
    expect(cmp.vm.showAlignmentGroupsEditorBlock).toBeTruthy()
    expect(cmp.vm.showTokensEditorBlock).toBeFalsy()

    expect(cmp.findComponent(OptionsBlock).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TextEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(AlignEditor).isVisible()).toBeTruthy()
    expect(cmp.findComponent(TokensEditor).isVisible()).toBeFalsy()
  })

  it('12 App - showTokensEditor - sets visible only TokensEditor block', async () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.shownOptionsBlock).toBeFalsy()
    expect(cmp.vm.showSourceTextEditorBlock).toBeFalsy()
    expect(cmp.vm.showAlignmentGroupsEditorBlock).toBeFalsy()
    expect(cmp.vm.showTokensEditorBlock).toBeFalsy()

    expect(cmp.findComponent(OptionsBlock).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TextEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(AlignEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TokensEditor).isVisible()).toBeFalsy()

    cmp.vm.showTokensEditor()

    await Vue.nextTick()

    expect(cmp.vm.shownOptionsBlock).toBeFalsy()
    expect(cmp.vm.showSourceTextEditorBlock).toBeFalsy()
    expect(cmp.vm.showAlignmentGroupsEditorBlock).toBeFalsy()
    expect(cmp.vm.showTokensEditorBlock).toBeTruthy()

    expect(cmp.findComponent(OptionsBlock).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TextEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(AlignEditor).isVisible()).toBeFalsy()
    expect(cmp.findComponent(TokensEditor).isVisible()).toBeTruthy()
  })

  it('13 App - startOver - starts alignment process from the beginning', async () => {
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
    jest.spyOn(cmp.vm.$textC, 'createAlignment')
    jest.spyOn(cmp.vm.$historyC, 'startTracking')
    jest.spyOn(NotificationSingleton, 'clearNotifications')
    jest.spyOn(cmp.vm, 'showSourceTextEditor')

    cmp.vm.startOver()

    expect(cmp.vm.$textC.createAlignment).toHaveBeenCalled()
    expect(cmp.vm.$historyC.startTracking).toHaveBeenCalled()
    expect(NotificationSingleton.clearNotifications).toHaveBeenCalled()
    expect(cmp.vm.showSourceTextEditor).toHaveBeenCalled()

  })
})


