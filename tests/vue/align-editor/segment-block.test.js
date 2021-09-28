/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import SegmentBlock from '@/vue/align-editor/segment-block.vue'
import TokenBlock from '@/vue/align-editor/token-block.vue'
import Token from '@/lib/data/token'
import SourceText from '@/lib/data/source-text'
import Alignment from '@/lib/data/alignment'
import Vue from '@vue-runtime'

import SettingsController from '@/lib/controllers/settings-controller'
import IndexedDB from 'fake-indexeddb'
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'
import VModal from 'vue-js-modal'

import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)

describe('segment-block.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  let appC, originSegment, allTargetTextsIds, targetSegment, targetSegment1, createAlignmentGroup, userID
  beforeAll(async () => {
    userID = Alignment.defaultUserID

    window.indexedDB = IndexedDB
    window.IDBKeyRange = IDBKeyRange

  })

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
    appC.defineStorageController()

    await appC.defineSettingsController(appC.store)
    appC.defineTextController(appC.store)
    appC.defineAlignedGroupsController(appC.store)
    appC.defineTokensEditController(appC.store)
    appC.defineHistoryAlGroupsController(appC.store)

    appC.textC.createAlignment()
    appC.historyAGC.startTracking(appC.textC.alignment)

    const originDocSource = new SourceText('origin', {
      text: '“Ein ziemlich unauffälliges Tier.\n“Vor rund 13,5 Milliarden Jahren entstanden Materie, Energie, Raum und Zeit in einem Ereignis namens Urknall.', direction: 'ltr', lang: 'deu', sourceType: 'text', tokenization: {
        tokenizer: 'simpleLocalTokenizer'
      }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'Un animal insignifiant\n“Il y a environ 13,5 milliards d’années, la matière, l’énergie, le temps et l’espace apparaissaient à l’occasion du Big Bang.', direction: 'ltr', lang: 'fra', sourceType: 'text', tokenization: {
        tokenizer: 'simpleLocalTokenizer'
      }
    })

    const targetDocSource2 = new SourceText('target', {
      text: '“Un animale di nessuna importanza\n“Circa tredici miliardi e mezzo di anni fa, materia, energia, tempo e spazio scaturirono da quello che è noto come il Big Bang.', direction: 'ltr', lang: 'ita', sourceType: 'text', tokenization: {
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

  const prepareParts = (amount) => {
    let arr = []
    for (let i = 1; i<=amount; i++) {
      arr.push({ partNum: i, len: expect.any(Number), segmentIndex: expect.any(Number) })
    }
    return arr
  }


  it('1 SegmentBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin'
      }
    })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 SegmentBlock - textType, direction, lang - retrieves from segment', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin'
      }
    })

    expect(cmp.vm.textType).toEqual(originSegment.textType)
    expect(cmp.vm.direction).toEqual(originSegment.direction)
    expect(cmp.vm.lang).toEqual(originSegment.lang)
  })

  it('3 SegmentBlock - cssId - defines unique id for HTML layout', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin'
      }
    })

    expect(cmp.vm.cssId).toEqual('alpheios-align-text-segment-origin-1')
    cmp.setProps({
      segmentIndex: targetSegment.index,
      textId: targetSegment.docSourceId,
      textType: 'target'
    })

    await Vue.nextTick()
    expect(cmp.vm.cssId).toEqual(`alpheios-align-text-segment-target-${allTargetTextsIds[1]}-2`)
  })

  it('4 SegmentBlock - cssStyle - defines direct css styles by properties', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin'
      }
    })

    expect(cmp.vm.cssStyle).toEqual(expect.stringContaining(`order: 1;`))
    expect(cmp.vm.cssStyleSeg).toEqual(expect.stringContaining(`background: ${cmp.vm.originColor};`))
    cmp.setProps({
      segmentIndex: targetSegment.index,
      textId: targetSegment.docSourceId,
      textType: 'target'
    })

    await Vue.nextTick()
    expect(cmp.vm.cssStyle).toEqual(expect.stringContaining(`order: 2;`)) // color for the second target
    expect(cmp.vm.cssStyleSeg).toEqual(expect.stringContaining(`background: ${cmp.vm.colors[1]};`)) // color for the second target
  })

  it('5 SegmentBlock - cssClass - contains class alpheios-align-text-segment-${segment.textType} and contains alpheios-align-text-segment-${segment.textType}-last if it is the last', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin',
        isLast: false
      }
    })

    expect(cmp.vm.cssClass).toHaveProperty('alpheios-align-text-segment-origin', true)
    expect(cmp.vm.cssClass).toHaveProperty('alpheios-align-text-segment-origin-last', false)

    cmp.setProps({
      segmentIndex: targetSegment.index,
      textId: targetSegment.docSourceId,
      textType: 'target',
      isLast: true
    })
    await Vue.nextTick()
    expect(cmp.vm.cssClass).toHaveProperty('alpheios-align-text-segment-target-last', true)
  })    

  it('6 SegmentBlock - allTargetTextsIds, targetIdIndex, targetId defines targetId data', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin'
      }
    })

    // we have an origin segment
    expect(cmp.vm.allTargetTextsIds).toEqual(allTargetTextsIds)
    expect(cmp.vm.targetIdIndex).toBeNull()

    cmp.setProps({
      segmentIndex: targetSegment.index,
      textId: targetSegment.docSourceId,
      textType: 'target'
    })
    await Vue.nextTick()
    // we have a target segment
    expect(cmp.vm.allTargetTextsIds).toEqual(allTargetTextsIds)
    expect(cmp.vm.targetIdIndex).toEqual(1)
  })    


  it('7 SegmentBlock - clickToken - starts click workflow we we have only one tab active', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin',
        currentTargetId: allTargetTextsIds[0]
      }
    })

    jest.spyOn(cmp.vm.$alignedGC, 'clickToken')

    const originToken = originSegment.tokens[0]

    // we have the first tab activated - we could create groups, click is active
    cmp.vm.updateAlignmentGroup(originToken)

    expect(cmp.vm.$alignedGC.clickToken).toHaveBeenLastCalledWith(originToken, allTargetTextsIds[0])

    cmp.setProps({
      currentTargetId: null
    })

    // we have both tabs activated - click should not be active
    cmp.vm.updateAlignmentGroup(originToken)
    expect(cmp.vm.$alignedGC.clickToken).not.toHaveBeenLastCalledWith(originToken, null)

    cmp.setProps({
      segmentIndex: targetSegment.index,
      textId: targetSegment.docSourceId,
      textType: 'target',
      currentTargetId: allTargetTextsIds[1]
    })
    await Vue.nextTick()
    // we activated the second tab and we are on a target segment
    const targetToken = targetSegment.tokens[0]

    cmp.vm.updateAlignmentGroup(targetToken)

    expect(cmp.vm.$alignedGC.clickToken).toHaveBeenLastCalledWith(targetToken, allTargetTextsIds[1])
  })


  it('8 SegmentBlock - addHoverToken - starts hover workflow', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin',
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

  it('9 SegmentBlock - removeHoverToken - ends hover workflow, current targetId doesn\'t influence', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin',
        currentTargetId: allTargetTextsIds[0]
      }
    })

    // the firt tab activated
    jest.spyOn(cmp.vm.$alignedGC, 'clearHoverOnAlignmentGroups')

    cmp.vm.removeHoverToken()

    expect(cmp.vm.$alignedGC.clearHoverOnAlignmentGroups).toHaveBeenCalled()
  })

  it('10 SegmentBlock - selectedToken - defines if token is hovered', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin',
        currentTargetId: allTargetTextsIds[1]
      }
    })

    createAlignmentGroup(true)

    // we didn't activate hover
    const steps = appC.alignedGC.alignment.alignmentHistory.steps

    expect(cmp.vm.selectedToken(steps[0].token, allTargetTextsIds[1])).toBeFalsy() // first origin token
    expect(cmp.vm.selectedToken(steps[1].token, allTargetTextsIds[1])).toBeFalsy() // target token
    cmp.vm.addHoverToken(steps[0].token) // activated hovering on the group

    // we activated hover
    expect(cmp.vm.selectedToken(steps[0].token, allTargetTextsIds[1])).toBeTruthy() // first origin token
    expect(cmp.vm.selectedToken(steps[1].token, allTargetTextsIds[1])).toBeTruthy() // target token
  })

  it('11 SegmentBlock - groupedToken - defines if token is grouped', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin',
        currentTargetId: allTargetTextsIds[1]
      }
    })

    createAlignmentGroup(true)

    const steps = appC.alignedGC.alignment.alignmentHistory.steps
    expect(cmp.vm.groupedToken(steps[0].token, allTargetTextsIds[1])).toBeTruthy() // first origin token
    expect(cmp.vm.groupedToken(steps[1].token, allTargetTextsIds[1])).toBeTruthy() // target token

    expect(cmp.vm.groupedToken(originSegment.tokens[1], allTargetTextsIds[1])).toBeFalsy() // was not added to the group
  })

  it('12 SegmentBlock - inActiveGroup, isFirstInActiveGroup - defines if token is in active group', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: originSegment.index,
        textId: originSegment.docSourceId,
        textType: 'origin',
        currentTargetId: allTargetTextsIds[1]
      }
    })

    createAlignmentGroup(false)
    const steps = appC.alignedGC.alignment.alignmentHistory.steps

    expect(cmp.vm.inActiveGroup(steps[0].token, allTargetTextsIds[1])).toBeTruthy() // first origin token
    expect(cmp.vm.inActiveGroup(steps[1].token, allTargetTextsIds[1])).toBeTruthy() // target token

    expect(cmp.vm.inActiveGroup(originSegment.tokens[1], allTargetTextsIds[1])).toBeFalsy() // was not added to the group

    expect(cmp.vm.isFirstInActiveGroup(steps[0].token, allTargetTextsIds[1])).toBeTruthy() // first origin token
    expect(cmp.vm.isFirstInActiveGroup(steps[1].token, allTargetTextsIds[1])).toBeFalsy() // target token
  })

  it('13 SegmentBlock - allPartsKeys, currentPartIndexes, allTokens, click next, click prev', async () => {
    let cmp = shallowMount(SegmentBlock, {
      store: appC.store,
      localVue,
      propsData: {
        segmentIndex: 2,
        textId: originSegment.docSourceId,
        textType: 'origin',
        currentTargetId: allTargetTextsIds[1]
      }
    })
    
    expect(cmp.vm.allPartsKeys).toEqual(prepareParts(1))
    SettingsController.allOptions.app.items.maxCharactersPerPart.currentValue = 5
    await cmp.vm.$textC.defineAllPartNumsForTexts()


    expect(cmp.vm.allPartsKeys).toEqual(prepareParts(5))
    expect(cmp.vm.currentPartIndexes).toEqual([ 1 ])
    
    expect(cmp.vm.allTokens.length).toEqual(5)
    expect(cmp.vm.allTokens.map(token => token.word)).toEqual([ 'Vor', 'rund', '13', '5', 'Milliarden'])

    expect(cmp.vm.showPrev).toBeFalsy()
    expect(cmp.vm.showNext).toBeTruthy()

    // click next
    await cmp.vm.uploadNextPart()

    expect(cmp.vm.currentPartIndexes).toEqual([ 1, 2 ])
    expect(cmp.vm.allTokens.length).toEqual(7)
    expect(cmp.vm.allTokens.map(token => token.word)).toEqual([ 'Vor', 'rund', '13', '5', 'Milliarden', 'Jahren', 'entstanden'])

    expect(cmp.vm.showPrev).toBeFalsy()
    expect(cmp.vm.showNext).toBeTruthy()

    // click next
    await cmp.vm.uploadNextPart()

    expect(cmp.vm.currentPartIndexes).toEqual([ 2, 3 ])
    expect(cmp.vm.allTokens.length).toEqual(4)
    expect(cmp.vm.allTokens.map(token => token.word)).toEqual([ 'Jahren', 'entstanden', 'Materie', 'Energie' ])

    // click prev
    await cmp.vm.uploadPrevPart()

    expect(cmp.vm.currentPartIndexes).toEqual([ 1, 2 ])
    expect(cmp.vm.allTokens.length).toEqual(7)
    expect(cmp.vm.allTokens.map(token => token.word)).toEqual([ 'Vor', 'rund', '13', '5', 'Milliarden', 'Jahren', 'entstanden'])

  }, 50000)

})
