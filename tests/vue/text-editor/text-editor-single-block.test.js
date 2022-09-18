import { mount, flushPromises } from '@vue/test-utils'
import { createStore } from 'vuex'
import { nextTick } from 'vue'

import AppController from '@/lib/controllers/app-controller.js'
import TextEditorSingleBlock from '@/vue/text-editor/text-editor-single-block.vue'
import StoreDefinition from '@/lib/store/store-definition'
import SourceText from '@/lib/data/source-text'
import SettingsController from '@/lib/controllers/settings-controller'
import ModalPlugin from '@/plugins/modal'

let appC, store, provideObj

import IndexedDB from 'fake-indexeddb'
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'

describe('text-editor-single-block.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  beforeAll(async () => {
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

    await appC.defineSettingsController()
    appC.defineTextController(appC.store)
    appC.defineAlignedGroupsController(appC.store)
    appC.defineTokensEditController(appC.store)
    appC.defineHistoryAlGroupsController(appC.store)

    provideObj = {
      $textC: appC.textC,
      $historyAGC: appC.historyAGC,
      $tokensEC: appC.tokensEC,
      $alignedGC: appC.alignedGC
    }
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

    SettingsController.allOptions.app.items.tokenizer.currentValue = 'simpleLocalTokenizer'
  })

  it('1 TextEditorSingleBlock - renders a vue instance (min requirements)', () => {
    let cmp = mount(TextEditorSingleBlock, {
      global: {
        plugins: [ appC.store, ModalPlugin ],
        provide: provideObj
      }
    })

    expect(cmp.exists()).toBeTruthy()
  })

  it.skip('2 TextEditorSingleBlock - insert text to text area and check language/direction', async () => {
    let cmp = mount(TextEditorSingleBlock, {
      global: {
        plugins: [ appC.store, ModalPlugin ],
        provide: provideObj
      }
    })

    const textAreaId = 'alpheios-alignment-editor-text-blocks-single__textarea_undefined-no-id'
    const textAreaTag = await cmp.find(`[id="${textAreaId}"]`)

    await textAreaTag.setValue('test origin text')
  })
})

