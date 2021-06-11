/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import TokenizeOptionsBlock from '@/vue/text-editor/tokenize-options-block.vue'
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import { Options } from 'alpheios-data-models'
import SettingsController from '@/lib/controllers/settings-controller'

import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)

let appC, localTextEditorOptions

describe('tokenize-options-block.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  const fixtureForRemoteSettings = () => {
    const defaultsTei = {
      domain: 'alpheios-remote-tokenization-tei',
      version: '1.0.0',
      description: 'Tokenize a TEI XML text',
      items: {
        segments: {
          defaultValue: 'body',
          labelText: 'Comma-separated list of elements which identify segments.',
          select: false,
          boolean: false
        },
        ignore: {
          defaultValue: 'label,ref,milestone,orig,abbr,head,title,teiHeader,del,g,bibl,front,back,speaker',
          labelText: 'Comma-separated list of elements whose contents should be ignored.',
          select: false,
          boolean: false
        },
        segstart: {
          defaultValue: 0,
          labelText: 'Starting segment index.',
          select: false,
          boolean: false
        },
        linebreaks: {
          defaultValue: 'p,div,seg,l,ab',
          labelText: 'Comma-separated list of elements to line-break after for display.',
          select: false,
          boolean: false
        },
        tbseg: {
          defaultValue: false,
          labelText: "True means 'alpheios_data_tb_sent' metadata to be set from segment index",
          select: false,
          boolean: true
        }
      }
    }

    const defaultsText = {
      domain: 'alpheios-remote-tokenization-text',
      version: '1.0.0',
      description: 'Tokenize a plain text document.',
      items: {
        segments: {
          defaultValue: 'singleline',
          labelText: 'Segment indicator.',
          select: true,
          boolean: false,
          values: [
            { value: 'singleline', text: 'singleline' },
            { value: 'doubline', text: 'doubline' }
          ]
        },
        segstart: {
          defaultValue: 0,
          labelText: 'Starting segment index.',
          select: false,
          boolean: false
        },
        tbseg: {
          defaultValue: false,
          labelText: "True means 'alpheios_data_tb_sent' metadata to be set from segment index.",
          select: false,
          boolean: true
        }
      }
    }

    return {
      alpheiosRemoteTokenizer: {
        text: new Options(defaultsText, new SettingsController.getStorageAdapter('alpheios-remote-tokenization-text')),
        tei: new Options(defaultsTei, new SettingsController.getStorageAdapter('alpheios-remote-tokenization-tei')) 
      }
    }
  }

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
    SettingsController.create(appC.store)
    await appC.defineSettingsController(appC.store)

    SettingsController.allOptions.tokenize = fixtureForRemoteSettings()
    SettingsController.allOptions.app.items.tokenizer.currentValue = 'alpheiosRemoteTokenizer'

    localTextEditorOptions = await SettingsController.cloneTextEditorOptions('target', 0)
    localTextEditorOptions.ready = true
  })

  it('1 TokenizeOptionsBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(TokenizeOptionsBlock, {
        store: appC.store,
        localVue,
        propsData: {
          localOptions: localTextEditorOptions
        }
      })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 TokenizeOptionsBlock - renders optionItem', () => {
    let cmp = shallowMount(TokenizeOptionsBlock, {
      store: appC.store,
      localVue,
      propsData: {
        localOptions: localTextEditorOptions
      }
    })
    
    const optionItems = cmp.findAll(OptionItemBlock)
    expect(optionItems.length).toEqual(1 + Object.keys(localTextEditorOptions.text.items).length + Object.keys(localTextEditorOptions.tei.items).length)
  })
})