/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import SegmentBlock from '@/vue/align-editor/segment-block.vue'
import TokenBlock from '@/vue/align-editor/token-block.vue'
import Token from '@/lib/data/token'
import SourceText from '@/lib/data/source-text'
import Vue from '@vue-runtime'

import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)

describe('segment-block.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  let appC, originSegment, allTargetTextsIds, targetSegment, targetSegment1, createAlignmentGroup
    
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

    appC.textC.createAlignment()
    appC.historyC.startTracking(appC.textC.alignment)

    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: {
        tokenizer: 'simpleLocalTokenizer'
      }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: {
        tokenizer: 'simpleLocalTokenizer'
      }
    })

    const targetDocSource2 = new SourceText('target', {
      text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: {
        tokenizer: 'simpleLocalTokenizer'
      }
    })

    appC.textC.alignment.updateOriginDocSource(originDocSource)
    appC.textC.alignment.updateTargetDocSource(targetDocSource1)
    appC.textC.alignment.updateTargetDocSource(targetDocSource2)
    await appC.alignedGC.createAlignedTexts(appC.textC.alignment)

    allTargetTextsIds = appC.textC.allTargetTextsIds

    originSegment = appC.alignedGC.allAlignedTextsSegments[0].origin
    targetSegment = appC.alignedGC.allAlignedTextsSegments[1].targets[allTargetTextsIds[1]]

    targetSegment1 = appC.alignedGC.allAlignedTextsSegments[0].targets[allTargetTextsIds[1]]

    createAlignmentGroup = (finished) => {
      appC.alignedGC.clickToken(originSegment.tokens[0], allTargetTextsIds[1]) // starts a group - an origin token
      appC.alignedGC.clickToken(targetSegment1.tokens[0], allTargetTextsIds[1]) // adds a target token

      const activeAlignmentGroup = appC.alignedGC.alignment.activeAlignmentGroup

      if (finished) {
        appC.alignedGC.clickToken(originSegment.tokens[0], allTargetTextsIds[1]) // finishes a group
      }

      return activeAlignmentGroup
    }
  })

  it('1 SegmentBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment
      }
    })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 SegmentBlock - should contain Tokens components for each token in alignTextData', () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment
      }
    })

    expect(cmp.findAllComponents(TokenBlock)).toHaveLength(originSegment.tokens.length)
  })


  it('4 SegmentBlock - textType, direction, lang - retrieves from segment', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment
      }
    })

    expect(cmp.vm.textType).toEqual(originSegment.textType)
    expect(cmp.vm.direction).toEqual(originSegment.direction)
    expect(cmp.vm.lang).toEqual(originSegment.lang)
  })

  it('5 SegmentBlock - cssId - defines unique id for HTML layout', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment // index 1
      }
    })

    expect(cmp.vm.cssId).toEqual('alpheios-align-text-segment-origin-1')
    cmp.setProps({
      segment: targetSegment // index 2, targetId[1]
    })

    await Vue.nextTick()
    expect(cmp.vm.cssId).toEqual(`alpheios-align-text-segment-target-${allTargetTextsIds[1]}-2`)
  })

  it('6 SegmentBlock - cssStyle - defines direct css styles by properties', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment // index 1
      }
    })

    expect(cmp.vm.cssStyle).toEqual(expect.stringContaining(`order: 1;`))
    expect(cmp.vm.cssStyleSeg).toEqual(expect.stringContaining(`background: ${cmp.vm.originColor};`))
    cmp.setProps({
      segment: targetSegment // index 2, targetId[0]
    })

    await Vue.nextTick()
    expect(cmp.vm.cssStyle).toEqual(expect.stringContaining(`order: 2;`)) // color for the second target
    expect(cmp.vm.cssStyleSeg).toEqual(expect.stringContaining(`background: ${cmp.vm.colors[1]};`)) // color for the second target
  })

  it('7 SegmentBlock - cssClass - contains class alpheios-align-text-segment-${segment.textType} and contains alpheios-align-text-segment-${segment.textType}-last if it is the last', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment,
        isLast: false
      }
    })

    expect(cmp.vm.cssClass).toHaveProperty('alpheios-align-text-segment-origin', true)
    expect(cmp.vm.cssClass).toHaveProperty('alpheios-align-text-segment-origin-last', false)

    cmp.setProps({
      segment: targetSegment,
      isLast: true
    })
    await Vue.nextTick()
    expect(cmp.vm.cssClass).toHaveProperty('alpheios-align-text-segment-target-last', true)
  })    

  it('8 SegmentBlock - allTargetTextsIds, targetIdIndex, targetId defines targetId data', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment
      }
    })

    // we have an origin segment
    expect(cmp.vm.allTargetTextsIds).toEqual(allTargetTextsIds)
    expect(cmp.vm.targetIdIndex).toBeNull()
    expect(cmp.vm.targetId).toBeNull()

    cmp.setProps({
      segment: targetSegment
    })
    await Vue.nextTick()
    // we have a target segment
    expect(cmp.vm.allTargetTextsIds).toEqual(allTargetTextsIds)
    expect(cmp.vm.targetIdIndex).toEqual(1)
    expect(cmp.vm.targetId).toEqual(allTargetTextsIds[1])
  })    


  it('9 SegmentBlock - clickToken - starts click workflow we we have only one tab active', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment,
        currentTargetId: allTargetTextsIds[0]
      }
    })

    jest.spyOn(cmp.vm.$alignedGC, 'clickToken')

    const originToken = originSegment.tokens[0]

    // we have the first tab activated - we could create groups, click is active
    cmp.vm.clickToken(originToken)

    expect(cmp.vm.$alignedGC.clickToken).toHaveBeenLastCalledWith(originToken, allTargetTextsIds[0])

    cmp.setProps({
      currentTargetId: null
    })

    // we have both tabs activated - click should not be active
    cmp.vm.clickToken(originToken)
    expect(cmp.vm.$alignedGC.clickToken).not.toHaveBeenLastCalledWith(originToken, null)

    cmp.setProps({
      segment: targetSegment,
      currentTargetId: allTargetTextsIds[1]
    })
    await Vue.nextTick()
    // we activated the second tab and we are on a target segment
    const targetToken = targetSegment.tokens[0]

    cmp.vm.clickToken(targetToken)

    expect(cmp.vm.$alignedGC.clickToken).toHaveBeenLastCalledWith(targetToken, allTargetTextsIds[1])
  })


  it('10 SegmentBlock - addHoverToken - starts hover workflow', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment,
        currentTargetId: allTargetTextsIds[0]
      }
    })

    // the firt tab activated
    jest.spyOn(cmp.vm.$alignedGC, 'activateHoverOnAlignmentGroups')

    const originToken = originSegment.tokens[0]
    cmp.vm.addHoverToken(originToken)

    expect(cmp.vm.$alignedGC.activateHoverOnAlignmentGroups).toHaveBeenLastCalledWith(originToken, allTargetTextsIds[0])

    cmp.setProps({
      currentTargetId: null
    })
    await Vue.nextTick()
    // both tabs are activated

    cmp.vm.addHoverToken(originToken)

    expect(cmp.vm.$alignedGC.activateHoverOnAlignmentGroups).toHaveBeenLastCalledWith(originToken, null)

  })

  it('11 SegmentBlock - removeHoverToken - ends hover workflow, current targetId doesn\'t influence', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment,
        currentTargetId: allTargetTextsIds[0]
      }
    })

    // the firt tab activated
    jest.spyOn(cmp.vm.$alignedGC, 'clearHoverOnAlignmentGroups')

    cmp.vm.removeHoverToken()

    expect(cmp.vm.$alignedGC.clearHoverOnAlignmentGroups).toHaveBeenCalled()
  })

  it('12 SegmentBlock - selectedToken - defines if token is hovered', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment,
        currentTargetId: allTargetTextsIds[1]
      }
    })

    const alGroup = createAlignmentGroup(true)

    // we didn't activate hover

    expect(cmp.vm.selectedToken(alGroup.steps[0].token, allTargetTextsIds[1])).toBeFalsy() // first origin token
    expect(cmp.vm.selectedToken(alGroup.steps[1].token, allTargetTextsIds[1])).toBeFalsy() // target token
    cmp.vm.addHoverToken(alGroup.steps[0].token) // activated hovering on the group

    // we activated hover
    expect(cmp.vm.selectedToken(alGroup.steps[0].token, allTargetTextsIds[1])).toBeTruthy() // first origin token
    expect(cmp.vm.selectedToken(alGroup.steps[1].token, allTargetTextsIds[1])).toBeTruthy() // target token
  })

  it('13 SegmentBlock - groupedToken - defines if token is grouped', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment,
        currentTargetId: allTargetTextsIds[1]
      }
    })

    const alGroup = createAlignmentGroup(true)

    expect(cmp.vm.groupedToken(alGroup.steps[0].token, allTargetTextsIds[1])).toBeTruthy() // first origin token
    expect(cmp.vm.groupedToken(alGroup.steps[1].token, allTargetTextsIds[1])).toBeTruthy() // target token

    expect(cmp.vm.groupedToken(originSegment.tokens[1], allTargetTextsIds[1])).toBeFalsy() // was not added to the group
  })

  it('14 SegmentBlock - inActiveGroup, isFirstInActiveGroup - defines if token is in active group', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segment: originSegment,
        currentTargetId: allTargetTextsIds[1]
      }
    })

    const alGroup = createAlignmentGroup(false)

    expect(cmp.vm.inActiveGroup(alGroup.steps[0].token, allTargetTextsIds[1])).toBeTruthy() // first origin token
    expect(cmp.vm.inActiveGroup(alGroup.steps[1].token, allTargetTextsIds[1])).toBeTruthy() // target token

    expect(cmp.vm.inActiveGroup(originSegment.tokens[1], allTargetTextsIds[1])).toBeFalsy() // was not added to the group

    expect(cmp.vm.isFirstInActiveGroup(alGroup.steps[0].token, allTargetTextsIds[1])).toBeTruthy() // first origin token
    expect(cmp.vm.isFirstInActiveGroup(alGroup.steps[1].token, allTargetTextsIds[1])).toBeFalsy() // target token
  })

})
