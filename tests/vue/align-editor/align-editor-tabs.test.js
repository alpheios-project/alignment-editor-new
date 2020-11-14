/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AlignEditorTabs from '@/vue/align-editor/align-editor-tabs.vue'
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

describe('align-editor-tabs.test.js', () => {
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
    await appC.defineSettingsController()

    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
    appC.defineTextController(appC.store)
    appC.defineAlignedController(appC.store)

    appC.updateTokenizerData({
      tokenizer: 'simpleLocalTokenizer'
    })
    
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
    await appC.alignedC.createAlignedTexts(appC.textC.alignment)
  })

  it('1 AlignEditorTabs - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(AlignEditorTabs,{
      store: appC.store,
      localVue,
      propsData: {
        tabs: ['id1', 'id2']
      }
    })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 AlignEditorTabs - tabsStates are defined on mounted step - set active for the first tab as default', () => {
    let cmp = shallowMount(AlignEditorTabs,{
      store: appC.store,
      localVue,
      propsData: {
        tabs: ['id1', 'id2']
      }
    })
    expect(cmp.vm.tabsStates).toEqual([ { active: true }, { active: false } ])
  })

  it('3 AlignEditorTabs - couldBeSelected checks we would have at least one tab active', () => {
    let cmp = shallowMount(AlignEditorTabs,{
      store: appC.store,
      localVue,
      propsData: {
        tabs: ['id1', 'id2']
      }
    })

    // by default the first is active

    // we could select the second and have both active
    expect(cmp.vm.couldBeSelected(1)).toBeTruthy()

    // we couldn't select the first because then we would have no active tabs
    expect(cmp.vm.couldBeSelected(0)).toBeFalsy()
  })

  it('4 AlignEditorTabs - selectTab if couldBeSelected, changes active state and emitts event', () => {
    let cmp = shallowMount(AlignEditorTabs,{
      store: appC.store,
      localVue,
      propsData: {
        tabs: ['id1', 'id2']
      }
    })

    // by default the first is active

    cmp.vm.selectTab('id1', 0) // it could not be selected 

    expect(cmp.vm.tabsStates).toEqual([ { active: true }, { active: false } ])
    expect(cmp.emitted()['selectTab']).toBeFalsy()
    
    cmp.vm.selectTab('id2', 1) // it could be selected 

    expect(cmp.vm.tabsStates).toEqual([ { active: true }, { active: true } ])
    expect(cmp.emitted()['selectTab']).toBeTruthy()
    expect(cmp.emitted()['selectTab'][0]).toEqual(['id2'])
  })
})
