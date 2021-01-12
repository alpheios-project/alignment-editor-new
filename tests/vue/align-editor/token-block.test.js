/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import EditorTabs from '@/vue/common/editor-tabs.vue'
import AppController from '@/lib/controllers/app-controller.js'
import Vue from '@vue-runtime'
import TokenBlock from '@/vue/align-editor/token-block.vue'
import Token from '@/lib/data/token'
import SourceText from '@/lib/data/source-text'
import Alignment from '@/lib/data/alignment'

import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)

let appC, token

describe('token-block.test.js', () => {
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

    token = appC.alignedC.allAlignedTextsSegments[0].origin.tokens[0]
  })

  it('1 TokenBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(TokenBlock,{
      store: appC.store,
      localVue,
      propsData: {
        token: token
      }
    })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 TokenBlock - tokenClasses defines css classes by passed props', () => {
    let cmp = shallowMount(TokenBlock,{
      store: appC.store,
      localVue,
      propsData: {
        token: token,
        selected: true,
        grouped: true,
        inActiveGroup: false,
        firstInActiveGroup: false
      }
    })
    expect(cmp.vm.tokenClasses).toEqual({
      'alpheios-token-selected': true, 
      'alpheios-token-grouped': true,
      'alpheios-token-clicked': false,
      'alpheios-token-clicked-first': false
    })
  })

  it('3 TokenBlock - clickToken, addHoverToken, removeHoverToken emit events', () => {
    let cmp = shallowMount(TokenBlock,{
      store: appC.store,
      localVue,
      propsData: {
        token: token
      }
    })
    cmp.vm.clickToken()
    expect(cmp.emitted()['click-token']).toBeTruthy()
    expect(cmp.emitted()['click-token'][0]).toEqual([ token ])

    cmp.vm.addHoverToken()
    expect(cmp.emitted()['add-hover-token']).toBeTruthy()
    expect(cmp.emitted()['add-hover-token'][0]).toEqual([ token ])

    cmp.vm.removeHoverToken()
    expect(cmp.emitted()['remove-hover-token']).toBeTruthy()
    expect(cmp.emitted()['remove-hover-token'][0]).toEqual([ token ])
  })

})
