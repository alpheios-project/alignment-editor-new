/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import App from '@/vue/app.vue'
import MainMenu from '@/vue/main-menu.vue'
import TextEditor from '@/vue/text-editor/text-editor.vue'
import AlignEditor from '@/vue/align-editor/align-editor.vue'

import TextsController from '@/lib/controllers/texts-controller.js'
import AppController from '@/lib/controllers/app-controller.js'
import AlignedController from '@/lib/controllers/aligned-controller.js'

describe('app.test.js', () => {
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

  it('1 App - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(App)
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 App - should contain MainMenu, TextEditor, AlignEditor', () => {
    let cmp = shallowMount(App)
    expect(cmp.findComponent(MainMenu)).toBeTruthy()
    expect(cmp.findComponent(TextEditor)).toBeTruthy()
    expect(cmp.findComponent(AlignEditor)).toBeTruthy()
  })

  it('3 App - updateOriginTextEditor - updates originTextUpdated to +1', () => {
    let cmp = shallowMount(App)
    expect(cmp.vm.originTextUpdated).toEqual(0)
    cmp.vm.updateOriginTextEditor()
    expect(cmp.vm.originTextUpdated).toEqual(1)
  })

  it('4 App - updateOriginTextEditor - updates targetTextUpdated to +1', () => {
    let cmp = shallowMount(App)
    expect(cmp.vm.targetTextUpdated).toEqual(0)
    cmp.vm.updateTargetTextEditor()
    expect(cmp.vm.targetTextUpdated).toEqual(1)
  })

  it('5 App - hideTextEditorM - updates hideTextEditor to +1', () => {
    let cmp = shallowMount(App)
    expect(cmp.vm.hideTextEditor).toEqual(0)
    cmp.vm.hideTextEditorM()
    expect(cmp.vm.hideTextEditor).toEqual(1)
  })

  it('6 App - showAlignEditorM - updates showAlignEditor to +1', () => {
    let cmp = shallowMount(App)
    expect(cmp.vm.showAlignEditor).toEqual(0)
    cmp.vm.showAlignEditorM()
    expect(cmp.vm.showAlignEditor).toEqual(1)
  })

  it('7 App - downloadData - executes textC.downloadData', () => {
    let cmp = shallowMount(App)

    expect(cmp.vm.$textC).toEqual(expect.any(TextsController))
    jest.spyOn(cmp.vm.$textC, 'downloadData')
    
    cmp.vm.downloadData()
    expect(cmp.vm.$textC.downloadData).toHaveBeenCalled()
  })


  it('8 App - uploadData - executes textC.uploadDocSourceFromFile, updateOriginTextEditor, updateTargetTextEditor', () => {
    let cmp = shallowMount(App)

    jest.spyOn(cmp.vm.$textC, 'uploadDocSourceFromFile')
    jest.spyOn(cmp.vm, 'updateOriginTextEditor')
    jest.spyOn(cmp.vm, 'updateTargetTextEditor')
    
    cmp.vm.uploadData('test data')
    expect(cmp.vm.$textC.uploadDocSourceFromFile).toHaveBeenCalledWith('test data')
    expect(cmp.vm.updateOriginTextEditor).toHaveBeenCalled()
    expect(cmp.vm.updateTargetTextEditor).toHaveBeenCalled()
  })

  it('9 App - alignTexts - executes $alignedC.createAlignedTexts, and if successfull - hideTextEditorM, showAlignEditorM', () => {
    let cmp = shallowMount(App)
    expect(cmp.vm.$alignedC).toEqual(expect.any(AlignedController))

    cmp.vm.$alignedC.createAlignedTexts = jest.fn(() => true)
    jest.spyOn(cmp.vm, 'hideTextEditorM')
    jest.spyOn(cmp.vm, 'showAlignEditorM')

    cmp.vm.alignTexts()

    expect(cmp.vm.$alignedC.createAlignedTexts).toHaveBeenCalled()
    expect(cmp.vm.hideTextEditorM).toHaveBeenCalled()
    expect(cmp.vm.showAlignEditorM).toHaveBeenCalled()
  })
})

it('10 App - alignTexts - executes $alignedC.createAlignedTexts, and if failed - no other methods', () => {
    let cmp = shallowMount(App)
    expect(cmp.vm.$alignedC).toEqual(expect.any(AlignedController))

    cmp.vm.$alignedC.createAlignedTexts = jest.fn(() => false)
    jest.spyOn(cmp.vm, 'hideTextEditorM')
    jest.spyOn(cmp.vm, 'showAlignEditorM')

    cmp.vm.alignTexts()

    expect(cmp.vm.$alignedC.createAlignedTexts).toHaveBeenCalled()
    expect(cmp.vm.hideTextEditorM).not.toHaveBeenCalled()
    expect(cmp.vm.showAlignEditorM).not.toHaveBeenCalled()
  })

