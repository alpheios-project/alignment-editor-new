import { mount, flushPromises } from '@vue/test-utils'
import { createStore } from 'vuex'
import { nextTick } from 'vue'

import AppController from '@/lib/controllers/app-controller.js'
import App from '@/vue/app.vue'
import StoreDefinition from '@/lib/store/store-definition'
import ModalPlugin from '@/plugins/modal'

import AlignmentsList from '@/vue/alignments-list.vue'

let appC, store, provideObj, editorsStubs

import IndexedDB from 'fake-indexeddb'
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'

describe('app.test.js', () => {
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

    editorsStubs = {
      TextEditor: {
        template: '<span>I am TextEditor</span>'
      },
      AlignEditor: {
        template: '<span>I am AlignEditor</span>'
      },
      TokensEditor: {
        template: '<span>I am AlignEditor</span>'
      }
    }
  })

  it('1 App - renders a vue instance (min requirements)', () => {
    let cmp = mount(App, {
      global: {
        plugins: [ appC.store, ModalPlugin ],
        provide: provideObj,
        stubs: editorsStubs
      }
    })

    expect(cmp.exists()).toBeTruthy()
  })

  it('2 App - click begin new alignment and then click cancel', async () => {
    let cmp = mount(App, {
      global: {
        plugins: [ appC.store, ModalPlugin ],
        provide: provideObj,
        stubs: editorsStubs
      }
    })

    const buttonNewAlignment = await cmp.find('[id="alpheios-editor-start-new-alignment"]')
    expect(buttonNewAlignment.exists()).toBeTruthy()
    await buttonNewAlignment.trigger('click')
    // console.info(cmp.html())

    const createAlTitleModal = await cmp.find('[id="alpheios-editor-modal-create-al-title"]')

    expect(createAlTitleModal.exists()).toBeTruthy()
    expect(createAlTitleModal.isVisible()).toBeTruthy()

    const createAlTitleInput = await cmp.find('[id="alpheios-file-name-al-title-id"]')
    expect(createAlTitleInput.exists()).toBeTruthy()

    await createAlTitleInput.setValue('test title')

    jest.spyOn(appC.textC, 'createAlignment')

    const createAlTitleCancelButton = await cmp.find('[id="alpheios-editor-create-al-title_cancel"]')
    expect(createAlTitleCancelButton.exists()).toBeTruthy()

    await createAlTitleCancelButton.trigger('click')

    expect(appC.textC.createAlignment).not.toHaveBeenCalled()

  })

  it('3 App - begin new alignment event, ok button is disabled if input is empty, update input - click ok', async () => {
    let cmp = mount(App, {
      global: {
        plugins: [ appC.store, ModalPlugin ],
        provide: provideObj,
        stubs: editorsStubs
      }
    })

    const buttonNewAlignment = await cmp.find('[id="alpheios-editor-start-new-alignment"]')
    expect(buttonNewAlignment.exists()).toBeTruthy()
    await buttonNewAlignment.trigger('click')
    // console.info(cmp.html())

    const createAlTitleModal = await cmp.find('[id="alpheios-editor-modal-create-al-title"]')

    expect(createAlTitleModal.exists()).toBeTruthy()
    expect(createAlTitleModal.isVisible()).toBeTruthy()

    const createAlTitleInput = await cmp.find('[id="alpheios-file-name-al-title-id"]')
    expect(createAlTitleInput.exists()).toBeTruthy()

    const createAlTitleOkButton = await cmp.find('[id="alpheios-editor-create-al-title_ok"]')
    expect(createAlTitleOkButton.exists()).toBeTruthy()
    expect(createAlTitleOkButton.attributes('disabled')).toBeDefined()

    await createAlTitleInput.setValue('test title')

    expect(createAlTitleOkButton.attributes('disabled')).not.toBeDefined()

    jest.spyOn(appC.textC, 'createAlignment')  

    await createAlTitleOkButton.trigger('click')

    expect(appC.textC.createAlignment).toHaveBeenCalledWith('test title')

    // expect(createAlTitleModal.exists()).toBeFalsy()
    // console.info(createAlTitleModal.html())
  })

  it('4 App - click resume alignment - shows 2 available options - ones you saved and autosaved ones', async () => {
    let cmp = mount(App, {
      global: {
        plugins: [ appC.store, ModalPlugin ],
        provide: provideObj,
        stubs: editorsStubs
      }
    })

    const buttonResumeAlignment = await cmp.find('[id="alpheios-editor-resume-prev-alignment"]')
    expect(buttonResumeAlignment.exists()).toBeTruthy()

    const buttonResumeAlignmentFile = await cmp.find('[id="alpheios-editor-resume-prev-alignment_file"]')
    const buttonResumeAlignmentAutosaved = await cmp.find('[id="alpheios-editor-resume-prev-alignment_autosaved"]')

    expect(buttonResumeAlignmentFile.exists()).toBeTruthy()
    expect(buttonResumeAlignmentAutosaved.exists()).toBeTruthy()

    expect(buttonResumeAlignmentFile.isVisible()).toBeFalsy()
    expect(buttonResumeAlignmentAutosaved.isVisible()).toBeFalsy()

    await buttonResumeAlignment.trigger('click')

    expect(buttonResumeAlignmentFile.isVisible()).toBeTruthy()
    expect(buttonResumeAlignmentAutosaved.isVisible()).toBeTruthy()

  })
})

