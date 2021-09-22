/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import EditorTabs from '@/vue/common/editor-tabs.vue'
import AppController from '@/lib/controllers/app-controller.js'
import Vue from '@vue-runtime'
import AlignEditorViewMode from '@/vue/align-editor/align-editor-view-mode.vue'
import Token from '@/lib/data/token'
import SourceText from '@/lib/data/source-text'
import Alignment from '@/lib/data/alignment'
import VModal from 'vue-js-modal'
import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)

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
    appC.defineHistoryAlGroupsController(appC.store)

    appC.textC.createAlignment()
    appC.historyAGC.startTracking(appC.textC.alignment)
    
    appC.textC.createAlignment()
    appC.historyAGC.startTracking(appC.textC.alignment)

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
  })

  it('1 EditorTabs - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(EditorTabs,{
      store: appC.store,
      localVue,
      propsData: {
        tabs: ['id1', 'id2']
      }
    })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 EditorTabs - tabsStates are defined on mounted step - set active for the first tab as default', () => {
    let cmp = shallowMount(EditorTabs,{
      store: appC.store,
      localVue,
      propsData: {
        tabs: ['id1', 'id2']
      }
    })
    expect(cmp.vm.tabsStates).toEqual([ { active: true }, { active: false } ])
  })

  it('3 EditorTabs - couldBeSelected checks we would have at least one tab active', () => {
    let cmp = shallowMount(EditorTabs,{
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

  it('4 EditorTabs - selectTab if couldBeSelected, changes active state and emitts event', () => {
    let cmp = shallowMount(EditorTabs,{
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
