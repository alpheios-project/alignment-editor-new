/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import SegmentBlock from '@/vue/align-editor/segment-block.vue'
import TokenBlock from '@/vue/align-editor/token-block.vue'
import Token from '@/lib/data/token'
import Vue from '@vue-runtime'

describe('align-editor-single-block.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  let originAlignedTextSegment
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

    originAlignedTextSegment = appC.alignedC.originAlignedText.segments[0]
  })
    
  beforeEach(() => {
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 SegmentBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(SegmentBlock, {
    propsData: {
      segment: originAlignedTextSegment
    }
    })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 SegmentBlock - should contain Tokens components for each token in alignTextData', () => {
    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment
      }
    })

    expect(cmp.findAllComponents(TokenBlock)).toHaveLength(originAlignedTextSegment.tokens.length)
  })

  it('3 SegmentBlock - catches alignmentUpdated and increments updated flag', async () => {
    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment,
        alignmentUpdated: 1
      }
    })

    expect(cmp.vm.updated).toEqual(1)

    cmp.setProps({ alignmentUpdated: 2 })
    await Vue.nextTick()

    expect(cmp.vm.updated).toEqual(2)
  })

  it('4 SegmentBlock - textType, direction, lang - retrieves from segment', async () => {
    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment
      }
    })

    expect(cmp.vm.textType).toEqual(originAlignedTextSegment.textType)
    expect(cmp.vm.direction).toEqual(originAlignedTextSegment.direction)
    expect(cmp.vm.lang).toEqual(originAlignedTextSegment.lang)
  })

  it('5 SegmentBlock - alignTextClass - contains textType and segment index, orderStyle - contains index', async () => {
    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment
      }
    })

    expect(cmp.vm.cssId).toEqual(expect.stringContaining(originAlignedTextSegment.textType))
    expect(cmp.vm.cssId).toEqual(expect.stringContaining(originAlignedTextSegment.index.toString()))

    expect(cmp.vm.orderStyle).toEqual(expect.stringContaining(originAlignedTextSegment.index.toString()))
  })

  it('6 SegmentBlock - cssClass - contains class alpheios-align-text-segment-${segment.textType} and contains alpheios-align-text-segment-${segment.textType}-last if it is the last', async () => {
    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment,
        isLast: false
      }
    })

    expect(cmp.vm.cssClass).toHaveProperty('alpheios-align-text-segment-origin', true)
    expect(cmp.vm.cssClass).toHaveProperty('alpheios-align-text-segment-origin-last', false)

    cmp.setProps({
      isLast: true
    })
    expect(cmp.vm.cssClass).toHaveProperty('alpheios-align-text-segment-origin-last', true)
  })    

  it('7 SegmentBlock - clickToken - emmits click-word event', async () => {
    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment
      }
    })

    const token = new Token({
      textType: 'origin', idWord: 'L1-2', word: 'some'})
    cmp.vm.clickToken(token)

    expect(cmp.emitted()['click-token']).toBeTruthy()
    expect(cmp.emitted()['click-token'][0]).toEqual([token])
  })

  it('8 SegmentBlock - addHoverToken - emmits add-hover-token event', async () => {
    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment
      }
    })

    const token = new Token({
      textType: 'origin', idWord: 'L1-2', word: 'some'})
    cmp.vm.addHoverToken(token)
  
    expect(cmp.emitted()['add-hover-token']).toBeTruthy()
    expect(cmp.emitted()['add-hover-token'][0]).toEqual([token])
  })

  it('9 SegmentBlock - removeHoverToken - emmits remove-hover-token event', async () => {
    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment
      }
    })

    const token = new Token({
      textType: 'origin', idWord: 'L1-2', word: 'some'})
    cmp.vm.removeHoverToken(token)
  
    expect(cmp.emitted()['remove-hover-token']).toBeTruthy()
    expect(cmp.emitted()['remove-hover-token'][0]).toEqual([])
  })

  it('10 SegmentBlock - selectedToken - checks if a token inside hovered and saved alignmentGroup', async () => {
    let showAlignment, result

    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment
      }
    })

    const token1 = new Token({
      textType: 'origin', idWord: 'L1:1-2', word: 'some'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2:1-2', word: 'some'})

    cmp.vm.$alignedC.clickToken(token1)
    cmp.vm.$alignedC.clickToken(token2)
    cmp.vm.$alignedC.clickToken(token1) //alignment group was created and saved

    const token3 = new Token({
      textType: 'origin', idWord: 'L1:1-3', word: 'text'}) //another token - not in a alignment group

    showAlignment = cmp.vm.$alignedC.findAlignmentGroupIds(token2)
    
    cmp.setProps({
      showAlignment: showAlignment
    })
 
    result = cmp.vm.selectedToken(token2)
    expect(result).toBeTruthy()

    result = cmp.vm.selectedToken(token3)
    expect(result).toBeFalsy()
  })

  it('11 SegmentBlock - groupedToken - checks if a token inside any saved alignmentGroup (created in previous test.9)', async () => {
    let result

    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment
      }
    })

    const token1 = new Token({
      textType: 'some', idWord: 'L1:1-2', word: 'some'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2:1-2', word: 'some'})

    const token3 = new Token({
      textType: 'origin', idWord: 'L1:1-3', word: 'text'}) //another token - not in a alignment group
 
    result = cmp.vm.groupedToken(token2)
    expect(result).toBeTruthy()

    result = cmp.vm.groupedToken(token3)
    expect(result).toBeFalsy()
  })

  it('12 SegmentBlock - inActiveGroup - checks if a token inside the currently active alignment group (created in previous test.9)', async () => {
    let result

    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment
      }
    })

    const token1 = new Token({
      textType: 'origin', idWord: 'L1:1-2', word: 'some'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2:1-2', word: 'some'})

    const token3 = new Token({
      textType: 'origin', idWord: 'L1:1-3', word: 'text'}) //another token - not in a alignment group
 
    expect(cmp.vm.inActiveGroup(token2)).toBeFalsy() // group is not activated

    cmp.vm.$alignedC.clickToken(token1) // activate group
    expect(cmp.vm.inActiveGroup(token2)).toBeTruthy() // group is activated

    cmp.vm.$alignedC.clickToken(token1) // deactivate group
  })

  it('13 SegmentBlock - isFirstInActiveGroup - checks if a token inside the currently active alignment group and it is the first (created in previous test.9)', async () => {
    let result

    let cmp = shallowMount(SegmentBlock, {
      propsData: {
        segment: originAlignedTextSegment
      }
    })

    const token1 = new Token({
      textType: 'origin', idWord: 'L1:1-2', word: 'some'})

    const token2 = new Token({
      textType: 'target', idWord: 'L2:1-2', word: 'some'})

    const token3 = new Token({
      textType: 'origin', idWord: 'L1:1-3', word: 'text'}) //another token - not in a alignment group
 
    expect(cmp.vm.isFirstInActiveGroup(token2)).toBeFalsy() // group is not activated

    cmp.vm.$alignedC.clickToken(token1) // activate group
    expect(cmp.vm.isFirstInActiveGroup(token2)).toBeFalsy() // group is activated but it is not the first
    expect(cmp.vm.isFirstInActiveGroup(token1)).toBeTruthy() // group is activated and it is the first

    cmp.vm.$alignedC.clickToken(token1) // deactivate group
  })
})