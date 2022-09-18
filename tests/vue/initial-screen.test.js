import { mount, flushPromises } from '@vue/test-utils'
import { createStore } from 'vuex'
import { nextTick } from 'vue'

import AppController from '@/lib/controllers/app-controller.js'
import InitialScreen from '@/vue/initial-screen.vue'
import StoreDefinition from '@/lib/store/store-definition'

import AlignmentsList from '@/vue/alignments-list.vue'

let appC, store, provideObj

import IndexedDB from 'fake-indexeddb'
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'

describe('initial-screen.test.js', () => {
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

    provideObj = {
      $textC: appC.textC
    }
  })

  it('1 InitialScreen - renders a vue instance (min requirements)', () => {
    let cmp = mount(InitialScreen, {
      global: {
        plugins: [ appC.store ],
        provide: provideObj
      }
    })

    expect(cmp.exists()).toBeTruthy()
  })

  it('2 InitialScreen - has two buttons - start and resume, alignment-list is not visible', async () => {
    let cmp = mount(InitialScreen, {
      global: {
        plugins: [ appC.store ],
        provide: provideObj,
        stubs: {
          AlignmentsList: {
            template: '<span>I am AlignmentsList</span>'
          }
        }
      }
    })

    await flushPromises()

    const buttons = cmp.findAll('[class="alpheios-alignment-editor-initial-screen__button"]')
    expect(buttons.length).toEqual(2)

    const alList = cmp.findComponent(AlignmentsList)
    expect(alList.exists()).toBeTruthy()
    expect(alList.isVisible()).toBeFalsy()

    // console.info(cmp.html())
  })

  it('3 InitialScreen - click on Resume Alignment - see choice from file and from DB', async () => {
    let cmp = mount(InitialScreen, {
      global: {
        plugins: [ appC.store ],
        provide: provideObj,
        stubs: {
          AlignmentsList: {
            template: '<span>I am AlignmentsList</span>'
          }
        }
      }
    })
    await flushPromises()

    const buttonsBlock = cmp.findAll('[class="alpheios-alignment-editor-initial-screen__button"]')
    const resumeButton = buttonsBlock[1].find('button')

    const buttonsFromResume = cmp.find('[class="alpheios-alignment-app-menu__upload-block-choice"]').findAll('button')
    expect(buttonsFromResume[0].isVisible()).toBeFalsy()
    expect(buttonsFromResume[1].isVisible()).toBeFalsy()

    await resumeButton.trigger('click')

    expect(buttonsFromResume[0].isVisible()).toBeTruthy()
    expect(buttonsFromResume[1].isVisible()).toBeTruthy()
  })

  it('4 InitialScreen - click on Resume Alignment -> autosaved makes alignment list visible', async () => {
    let cmp = mount(InitialScreen, {
      global: {
        plugins: [ appC.store ],
        provide: provideObj,
        stubs: {
          AlignmentsList: {
            template: '<span>I am AlignmentsList</span>'
          }
        }
      }
    })
    await flushPromises()

    const alList = cmp.findComponent(AlignmentsList)
    expect(alList.isVisible()).toBeFalsy()

    await cmp.findAll('[class="alpheios-alignment-editor-initial-screen__button"]')[1].find('button').trigger('click')

    await cmp.find('[class="alpheios-alignment-app-menu__upload-block-choice"]').findAll('button')[1].trigger('click')

    expect(alList.isVisible()).toBeTruthy()
  })
})

