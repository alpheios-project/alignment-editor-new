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

describe('align-editor-view-mode.test.js', () => {
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
    appC.defineAlignedController(appC.store)
    appC.defineHistoryController(appC.store)

    appC.textC.createAlignment()
    appC.historyC.startTracking(appC.textC.alignment)
    
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
    await appC.alignedC.createAlignedTexts(appC.textC.alignment)
  })

  it('1 AlignEditorViewMode - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(AlignEditorViewMode,{
      store: appC.store,
      localVue
    })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 AlignEditorViewMode - allTokenizedTargetTextsIds returns current list of targets, shownTabs is updated once', () => {
    let cmp = shallowMount(AlignEditorViewMode,{
      store: appC.store,
      localVue
    })
    
    const allTokenizedTargetTextsIds = cmp.vm.$textC.allTokenizedTargetTextsIds

    expect(cmp.vm.allTokenizedTargetTextsIds).toEqual(allTokenizedTargetTextsIds)
    expect(cmp.vm.shownTabsInited).toBeTruthy()
    expect(cmp.vm.shownTabs).toEqual([ allTokenizedTargetTextsIds[0] ])
    
    cmp.vm.$alignedC.clickToken(cmp.vm.$alignedC.allAlignedTextsSegments[0].origin.tokens[0]) // executes alignmentUpdated in store

    expect(cmp.vm.allTokenizedTargetTextsIds).toEqual(allTokenizedTargetTextsIds)
    expect(cmp.vm.shownTabsInited).toBeTruthy()
    expect(cmp.vm.shownTabs).toEqual([ allTokenizedTargetTextsIds[0] ])
  })

  it('3 AlignEditorViewMode - allAlignedTextsSegments returns a formatted segments list', () => {
    let cmp = shallowMount(AlignEditorViewMode,{
      store: appC.store,
      localVue
    })
    
    const allAlignedTextsSegments = cmp.vm.$alignedC.allAlignedTextsSegments

    expect(allAlignedTextsSegments.length).toEqual(2) // we have two segments
  })

  it('4 AlignEditorViewMode - orderedTargetsId, lastTargetId, currentTargetId defines values based on active tabs, selectTab changes shown tabs', () => {
    let cmp = shallowMount(AlignEditorViewMode,{
      store: appC.store,
      localVue
    })
    
    const allTargetTextsIds = cmp.vm.$textC.allTargetTextsIds
    
    // by default we have only one active tab (the first)

    expect(cmp.vm.orderedTargetsId).toEqual([ allTargetTextsIds[0] ])
    expect(cmp.vm.lastTargetId).toEqual(allTargetTextsIds[0])
    expect(cmp.vm.currentTargetId).toEqual(allTargetTextsIds[0])

    cmp.vm.selectTab(allTargetTextsIds[1])

    // now we have both tabs active

    expect(cmp.vm.orderedTargetsId).toEqual(allTargetTextsIds) // we always have the same order as in alignment
    expect(cmp.vm.lastTargetId).toEqual(allTargetTextsIds[1])
    expect(cmp.vm.currentTargetId).toBeNull()

    cmp.vm.selectTab(allTargetTextsIds[0])

    // now we have one active tab (the second)

    expect(cmp.vm.orderedTargetsId).toEqual([ allTargetTextsIds[1] ])
    expect(cmp.vm.lastTargetId).toEqual(allTargetTextsIds[1])
    expect(cmp.vm.currentTargetId).toEqual(allTargetTextsIds[1])

    cmp.vm.selectTab(allTargetTextsIds[0])
    cmp.vm.selectTab(allTargetTextsIds[1])

    // now we again have one active tab (the first)
    expect(cmp.vm.orderedTargetsId).toEqual([ allTargetTextsIds[0] ])
    expect(cmp.vm.lastTargetId).toEqual(allTargetTextsIds[0])
    expect(cmp.vm.currentTargetId).toEqual(allTargetTextsIds[0])
  })

  it('5 AlignEditorViewMode - isShownTab defines if a targetId is shown', () => {
    let cmp = shallowMount(AlignEditorViewMode,{
      store: appC.store,
      localVue
    })
    
    const allTargetTextsIds = cmp.vm.$textC.allTargetTextsIds

    // by default we have only one active tab (the first)

    expect(cmp.vm.isShownTab(allTargetTextsIds[0])).toBeTruthy()
    expect(cmp.vm.isShownTab(allTargetTextsIds[1])).toBeFalsy()

    cmp.vm.selectTab(allTargetTextsIds[1])

    // now we have both tabs active

    expect(cmp.vm.isShownTab(allTargetTextsIds[0])).toBeTruthy()
    expect(cmp.vm.isShownTab(allTargetTextsIds[1])).toBeTruthy()

    cmp.vm.selectTab(allTargetTextsIds[0])

    // now we have one active tab (the second)

    expect(cmp.vm.isShownTab(allTargetTextsIds[0])).toBeFalsy()
    expect(cmp.vm.isShownTab(allTargetTextsIds[1])).toBeTruthy()
  })

  it('6 AlignEditorViewMode - getIndex unique index of the segment', () => {
    let cmp = shallowMount(AlignEditorViewMode,{
      store: appC.store,
      localVue
    })
    
    const allTargetTextsIds = cmp.vm.$textC.allTargetTextsIds

    const index1 = cmp.vm.getIndex('origin', 1) // it is the first origin segment
    expect(index1).toEqual('origin-1')

    const index2 = cmp.vm.getIndex('target', 1, allTargetTextsIds[0]) // it is the first target segment from the first target
    expect(index2).toEqual(`target-1-${allTargetTextsIds[0]}`)
  })

})

