/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AlignEditor from '@/vue/align-editor/align-editor.vue'
import AppController from '@/lib/controllers/app-controller.js'
import Vue from '@vue-runtime'
import AlignEditorViewMode from '@/vue/align-editor/align-editor-view-mode.vue'
import Token from '@/lib/data/token'
import SourceText from '@/lib/data/source-text'
import Alignment from '@/lib/data/alignment'

import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)

let appC

describe('align-editor.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  beforeEach(() => {
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')

    appC = new AppController({
      appId:'alpheios-alignment-editor'
    })
    
    appC.defineStore()
    appC.defineL10Support()
    appC.defineTextController(appC.store)
    appC.defineAlignedController(appC.store)
    appC.defineHistoryController(appC.store)

    appC.textC.createAlignment()
    appC.historyC.startTracking(appC.textC.alignment)

    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat'
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat'
    })

    const targetDocSource2 = new SourceText('target', {
      text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat'
    })

    appC.textC.alignment.updateOriginDocSource(originDocSource)
    appC.textC.alignment.updateTargetDocSource(targetDocSource1)
    appC.textC.alignment.updateTargetDocSource(targetDocSource2)
    appC.alignedC.createAlignedTexts(appC.textC.alignment)
  })

  it('1 AlignEditor - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(AlignEditor,{
      store: appC.store,
      localVue
    })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 AlignEditor - should contain two AlignEditorSingleBlock', () => {
    let cmp = shallowMount(AlignEditor,{
      store: appC.store,
      localVue
    })

    expect(cmp.findAllComponents(AlignEditorViewMode)).toHaveLength(1)
  })

  it('3 AlignEditor - if showEditor would change, then showAlignBlocks would be set to true', async () => {
    let cmp = shallowMount(AlignEditor, {
      store: appC.store,
      localVue,
      propsData: {
        showEditor: 0
      }
    })

    expect(cmp.vm.showAlignBlocks).toBeFalsy()

    cmp.setProps({ showEditor: 2 })
    await Vue.nextTick()
    expect(cmp.vm.showAlignBlocks).toBeTruthy()
  })

  it('4 AlignEditor - showAlignBlocksLabel defines show/hide label depending on showAlignBlocks', async () => {
    let cmp = shallowMount(AlignEditor, {
      store: appC.store,
      localVue,
      propsData: {
        showEditor: 0
      }
    })

    expect(cmp.vm.showAlignBlocks).toBeFalsy() // invisible by default
    expect(cmp.vm.showAlignBlocksLabel).toEqual(expect.stringContaining('show'))

    cmp.vm.showAlignBlocks = true
    expect(cmp.vm.showAlignBlocksLabel).toEqual(expect.stringContaining('hide'))
  })

  it('5 AlignEditor - showAlignEditor checks if there is enough data to render AlignEditorSingleBlock', async () => {
    let cmp = shallowMount(AlignEditor, {
      store: appC.store,
      localVue,
      propsData: {
        showEditor: 0
      }
    })

    expect(cmp.vm.showAlignEditor).toBeTruthy()

    appC.textC.alignment.clearAlignedTexts()
    appC.textC.updateTargetDocSource()

    expect(cmp.vm.showAlignEditor).toBeFalsy()
  })


  it('7 AlignEditor - toggleShowAlignBlocks toggle showAlignBlocks value', async () => {
    let cmp = shallowMount(AlignEditor, {
      store: appC.store,
      localVue,
      propsData: {
        showEditor: 0
      }
    })

    expect(cmp.vm.showAlignBlocks).toBeFalsy()
    cmp.vm.toggleShowAlignBlocks()
    expect(cmp.vm.showAlignBlocks).toBeTruthy()
  }) 
  
  it('8 AlignEditor - toggleShowAlignBlocks toggle showAlignBlocks value', async () => {
    let cmp = shallowMount(AlignEditor, {
      store: appC.store,
      localVue,
      propsData: {
        showEditor: 0
      }
    })

    expect(cmp.vm.showAlignBlocks).toBeFalsy()

    cmp.vm.toggleShowAlignBlocks()
    expect(cmp.vm.showAlignBlocks).toBeTruthy()
  }) 

})
