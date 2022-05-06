/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import ActionsMenuTokenEdit from '@/vue/tokens-editor/actions-menu-token-edit.vue'
import AppController from '@/lib/controllers/app-controller.js'
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
    appC.defineAlignedGroupsController(appC.store)
    appC.defineTokensEditController(appC.store)
    appC.defineHistoryAlGroupsController(appC.store)
  
    appC.textC.createAlignment()
    appC.historyAGC.startTracking(appC.textC.alignment)
      
    appC.textC.createAlignment()
    appC.historyAGC.startTracking(appC.textC.alignment)
  
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: {
        tokenizer: 'simpleLocalTokenizer',
        divideToSegments: true
      }
    })
  
    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: {
        tokenizer: 'simpleLocalTokenizer',
        divideToSegments: true
      }
    })
  
    const targetDocSource2 = new SourceText('target', {
      text: 'some target2 text\u2028for target2 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: {
        tokenizer: 'simpleLocalTokenizer',
        divideToSegments: true
      }
    })
  
    appC.textC.alignment.updateOriginDocSource(originDocSource)
    appC.textC.alignment.updateTargetDocSource(targetDocSource1)
    appC.textC.alignment.updateTargetDocSource(targetDocSource2)
    await appC.alignedGC.createAlignedTexts(appC.textC.alignment)

    appC.tokensEC.loadAlignment(appC.textC.alignment)
    console.info(appC.textC.alignment.origin.alignedText.segments[0].tokens[0])
  })

  it('1 ActionsMenuTokenEdit - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(ActionsMenuTokenEdit,{
      store: appC.store,
      localVue,
      propsData: {
        token: appC.textC.alignment.origin.alignedText.segments[0].tokens[0]
      }
    })

    
    expect(cmp.isVueInstance()).toBeTruthy()
  })

})
