/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AlignEditor from '@/vue/align-editor/align-editor.vue'
import AppController from '@/lib/controllers/app-controller.js'
import Vue from '@vue-runtime'
import AlignEditorSingleBlock from '@/vue/align-editor/align-editor-single-block.vue'
import Token from '@/lib/data/token'

describe('align-editor.test.js', () => {
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

    const sourceTextOrigin = {
      text: 'origin some text', direction: 'ltr', lang: 'lat'
    }
    const sourceTextTargetCorect = {
      text: 'target some text', direction: 'ltr', lang: 'lat'
    }
    
    appC.textC.createAlignment()
    appC.textC.updateOriginDocSource(sourceTextOrigin)
    appC.textC.updateTargetDocSource(sourceTextTargetCorect)
  
    appC.alignedC.createAlignedTexts(appC.textC.alignment)
  })
   
  beforeEach(() => {
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 AlignEditor - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(AlignEditor)
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 AlignEditor - should contain two AlignEditorSingleBlock', () => {
    let cmp = shallowMount(AlignEditor)

    expect(cmp.findAllComponents(AlignEditorSingleBlock)).toHaveLength(2)
  })

  it('3 AlignEditor - if showEditor would change, then showAlignBlocks would be set to true', async () => {
    let cmp = shallowMount(AlignEditor, {
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
      propsData: {
        showEditor: 0
      }
    })

    expect(cmp.vm.showAlignEditor).toBeTruthy()
    expect(cmp.findAllComponents(AlignEditorSingleBlock)).toHaveLength(2)

    const buffer = cmp.vm.$alignedC.alignment.origin.alignedText
    cmp.vm.$alignedC.alignment.origin.alignedText = {}

    cmp.setProps({
      showEditor: 2
    })
    await Vue.nextTick()
    expect(cmp.vm.showAlignEditor).toBeFalsy()
    expect(cmp.findAllComponents(AlignEditorSingleBlock)).toHaveLength(0)

    cmp.vm.$alignedC.alignment.origin.alignedText = buffer
  })

  it('6 AlignEditor - updateTokenClasses, updateOriginEditor, updateTargetEditor updates flags for tracking changes', async () => {
    let cmp = shallowMount(AlignEditor, {
      propsData: {
        showEditor: 0
      }
    })

    expect(cmp.vm.alignmentUpdated).toEqual(1)
    expect(cmp.vm.originUpdated).toEqual(1)
    expect(cmp.vm.targetUpdated).toEqual(1)

    cmp.vm.updateTokenClasses()
    expect(cmp.vm.alignmentUpdated).toEqual(2)
    expect(cmp.vm.originUpdated).toEqual(1)
    expect(cmp.vm.targetUpdated).toEqual(1)

    cmp.vm.updateOriginEditor()
    expect(cmp.vm.alignmentUpdated).toEqual(2)
    expect(cmp.vm.originUpdated).toEqual(2)
    expect(cmp.vm.targetUpdated).toEqual(1)

    cmp.vm.updateTargetEditor()
    expect(cmp.vm.alignmentUpdated).toEqual(2)
    expect(cmp.vm.originUpdated).toEqual(2)
    expect(cmp.vm.targetUpdated).toEqual(2)
  })

  it('7 AlignEditor - toggleShowAlignBlocks toggle showAlignBlocks value', async () => {
    let cmp = shallowMount(AlignEditor, {
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
      propsData: {
        showEditor: 0
      }
    })

    expect(cmp.vm.showAlignBlocks).toBeFalsy()

    cmp.vm.toggleShowAlignBlocks()
    expect(cmp.vm.showAlignBlocks).toBeTruthy()
  }) 

  it('9 AlignEditor - clickToken executes $alignedC.clickToken with the token and updates css classes', async () => {
    let cmp = shallowMount(AlignEditor, {
      propsData: {
        showEditor: 0
      }
    })

    expect(cmp.vm.alignmentUpdated).toEqual(1)
    jest.spyOn(cmp.vm.$alignedC, 'clickToken')
     const token = new Token({
      textType: 'origin', idWord: 'L1-10', word: 'male'})

    cmp.vm.clickToken(token)

    expect(cmp.vm.$alignedC.clickToken).toHaveBeenCalledWith(token)
    expect(cmp.vm.alignmentUpdated).toEqual(2)
  }) 

  it('10 AlignEditor - addHoverToken/removeHoverToken updates showAlignment array', async () => {
    let cmp = shallowMount(AlignEditor, {
      propsData: {
        showEditor: 0
      }
    })

    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})

    const token2 = new Token({
        textType: 'target', idWord: 'L2-10', word: 'man'})

    cmp.vm.clickToken(token)
    cmp.vm.clickToken(token2)
    cmp.vm.clickToken(token)

    expect(cmp.vm.showAlignment).toEqual([])

    cmp.vm.addHoverToken(token)
    expect(cmp.vm.showAlignment).toEqual(['L1-10', 'L2-10'])
    cmp.vm.removeHoverToken()
    expect(cmp.vm.showAlignment).toEqual([])
  })
})
