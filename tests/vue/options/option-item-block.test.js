/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import { LocalStorageArea, Options } from 'alpheios-data-models'

import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)

let appC, localTextEditorOptions

describe('option-item-block.test.js', () => {
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
        text: new Options(defaultsText, new appC.settingsC.storageAdapter('alpheios-remote-tokenization-text')),
        tei: new Options(defaultsTei, new appC.settingsC.storageAdapter('alpheios-remote-tokenization-tei')) 
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

    await appC.defineSettingsController()
    await appC.settingsC.init()

    appC.settingsC.options.tokenize = fixtureForRemoteSettings()
    
    appC.settingsC.options.app.items.tokenizer.currentValue = 'alpheiosRemoteTokenizer'
  })

  it('1 OptionItemBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(OptionItemBlock, {
        store: appC.store,
        localVue,
        propsData: {
          optionItem: appC.settingsC.options.app.items.theme
        }
      })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 OptionItemBlock - renders select optionItem', () => {
    let cmp = shallowMount(OptionItemBlock, {
        store: appC.store,
        localVue,
        propsData: {
          optionItem: appC.settingsC.options.app.items.theme // theme option with select type
        }
      })
    
    expect(cmp.vm.optionType).toEqual('select')
    expect(cmp.vm.itemId).toEqual('alpheios-alignment-editor-app__1__theme-id')

    expect(cmp.find(`#${cmp.vm.itemId}`).isVisible()).toBeTruthy()

    expect(cmp.vm.values).toEqual(appC.settingsC.options.app.items.theme.values)
    expect(cmp.vm.labelText).toEqual(cmp.vm.optionItem.labelText)

    expect(cmp.vm.selected).toEqual(appC.settingsC.options.app.items.theme.currentValue) // set default value

    // not used selectInputLabelsSelect
    expect(cmp.vm.checkboxLabel).toBeNull()
    expect(cmp.vm.selectInputLabelsSelect).toBeNull()
    expect(cmp.vm.selectInputLabelsInput).toBeNull()
    expect(cmp.vm.selectInputDescription).toBeNull()

    // check change workflow
    jest.spyOn(cmp.vm.$settingsC, 'changeOption')

    cmp.vm.selected = 'standard-theme'
    cmp.vm.changeOption()
    
    expect(appC.settingsC.options.app.items.theme.currentValue).toEqual('standard-theme')
    expect(cmp.vm.$settingsC.changeOption).toHaveBeenLastCalledWith(cmp.vm.optionItem)
    expect(cmp.emitted()['updateData']).toBeFalsy()
  })

  it('3 OptionItemBlock - renders text optionItem', () => {
    let cmp = shallowMount(OptionItemBlock, {
        store: appC.store,
        localVue,
        propsData: {
          optionItem: appC.settingsC.options.tokenize.alpheiosRemoteTokenizer.text.items.segstart // segstart option with text type
        }
      })
    
    expect(cmp.vm.optionType).toEqual('text')
    expect(cmp.vm.itemId).toEqual('alpheios-remote-tokenization-text__1_0_0__segstart-id')

    expect(cmp.find(`#${cmp.vm.itemId}`).isVisible()).toBeTruthy()

    expect(cmp.vm.labelText).toEqual(cmp.vm.optionItem.labelText)

    expect(cmp.vm.selected).toEqual(appC.settingsC.options.tokenize.alpheiosRemoteTokenizer.text.items.segstart.currentValue) // set default value

    // not used 
    expect(cmp.vm.values).toBeNull()
    expect(cmp.vm.checkboxLabel).toBeNull()
    expect(cmp.vm.selectInputLabelsSelect).toBeNull()
    expect(cmp.vm.selectInputLabelsInput).toBeNull()
    expect(cmp.vm.selectInputDescription).toBeNull()

    // check change workflow
    jest.spyOn(cmp.vm.$settingsC, 'changeOption')

    cmp.vm.selected = '2'
    cmp.vm.changeOption()
    
    expect(appC.settingsC.options.tokenize.alpheiosRemoteTokenizer.text.items.segstart.currentValue).toEqual('2')
    expect(cmp.vm.$settingsC.changeOption).toHaveBeenLastCalledWith(cmp.vm.optionItem)
    expect(cmp.emitted()['updateData']).toBeFalsy()
  })

  it('4 OptionItemBlock - renders checkbox optionItem', () => {
    let cmp = shallowMount(OptionItemBlock, {
        store: appC.store,
        localVue,
        propsData: {
          optionItem: appC.settingsC.options.tokenize.alpheiosRemoteTokenizer.text.items.tbseg, // tbseg option with boolean type
          showCheckboxTitle: false
        }
      })
    
    expect(cmp.vm.optionType).toEqual('boolean')
    expect(cmp.vm.itemId).toEqual('alpheios-remote-tokenization-text__1_0_0__tbseg-id')

    expect(cmp.find(`#${cmp.vm.itemId}`).isVisible()).toBeTruthy()

    expect(cmp.vm.labelText).toEqual(cmp.vm.optionItem.labelText)

    expect(cmp.vm.selected).toEqual(appC.settingsC.options.tokenize.alpheiosRemoteTokenizer.text.items.tbseg.currentValue) // set default value
    expect(cmp.vm.checkboxLabel).toBeNull()

    // not used 
    expect(cmp.vm.values).toBeNull()
    
    expect(cmp.vm.selectInputLabelsSelect).toBeNull()
    expect(cmp.vm.selectInputLabelsInput).toBeNull()
    expect(cmp.vm.selectInputDescription).toBeNull()

    // check change workflow
    jest.spyOn(cmp.vm.$settingsC, 'changeOption')

    cmp.vm.selected = true
    cmp.vm.changeOption()
    
    expect(appC.settingsC.options.tokenize.alpheiosRemoteTokenizer.text.items.tbseg.currentValue).toEqual(true)
    expect(cmp.vm.$settingsC.changeOption).toHaveBeenLastCalledWith(cmp.vm.optionItem)
    expect(cmp.emitted()['updateData']).toBeFalsy()
  })

  it('5 OptionItemBlock - renders radio optionItem', () => {
    let cmp = shallowMount(OptionItemBlock, {
        store: appC.store,
        localVue,
        propsData: {
          optionItem: appC.settingsC.options.sourceText.items.direction // direction option with radio type
        }
      })
    
    expect(cmp.vm.optionType).toEqual('radio')
    expect(cmp.vm.itemId).toEqual('alpheios-alignment-editor-source-text__1__direction-id')

    expect(cmp.find(`#${cmp.vm.itemIdWithValue('ltr')}`).isVisible()).toBeTruthy()

    expect(cmp.vm.labelText).toEqual(cmp.vm.optionItem.labelText)

    expect(cmp.vm.selected).toEqual(appC.settingsC.options.sourceText.items.direction.currentValue) // set default value

    expect(cmp.vm.values).toEqual(appC.settingsC.options.sourceText.items.direction.values)

    // not used 
    expect(cmp.vm.checkboxLabel).toBeNull()    
    expect(cmp.vm.selectInputLabelsSelect).toBeNull()
    expect(cmp.vm.selectInputLabelsInput).toBeNull()
    expect(cmp.vm.selectInputDescription).toBeNull()

    // check change workflow
    jest.spyOn(cmp.vm.$settingsC, 'changeOption')

    cmp.vm.selected = 'rtl'
    cmp.vm.changeOption()
    
    expect(appC.settingsC.options.sourceText.items.direction.currentValue).toEqual('rtl')
    expect(cmp.vm.$settingsC.changeOption).toHaveBeenLastCalledWith(cmp.vm.optionItem)
    expect(cmp.emitted()['updateData']).toBeFalsy()
  })

  it('6 OptionItemBlock - renders selectInput optionItem', () => {
    let cmp = shallowMount(OptionItemBlock, {
        store: appC.store,
        localVue,
        propsData: {
          optionItem: appC.settingsC.options.sourceText.items.language, // direction option with radio type
          labelsListType: 'origin'
        }
      })
    
    expect(cmp.vm.optionType).toEqual('selectInput')
    expect(cmp.vm.itemId).toEqual('alpheios-alignment-editor-source-text__1__language-id')

    expect(cmp.find(`#${cmp.vm.itemId}-select`).isVisible()).toBeTruthy()
    expect(cmp.find(`#${cmp.vm.itemId}-input`).isVisible()).toBeTruthy()

    expect(cmp.vm.labelText).toEqual(cmp.vm.optionItem.labelText)

    expect(cmp.vm.selectedS).toEqual(appC.settingsC.options.sourceText.items.language.currentValue) // set default value from the list - available language
    expect(cmp.vm.selectedI).toBeNull() // it is empty - choose another language
    expect(cmp.vm.selected).toEqual(appC.settingsC.options.sourceText.items.language.currentValue)

    expect(cmp.vm.values).toEqual(appC.settingsC.options.sourceText.items.language.values)

    expect(cmp.vm.selectInputLabelsSelect).toEqual(appC.settingsC.options.sourceText.items.language.labelsList[cmp.vm.labelsListType].selectLabel) // get label from the optionItem for select
    expect(cmp.vm.selectInputLabelsInput).toEqual(appC.settingsC.options.sourceText.items.language.labelsList[cmp.vm.labelsListType].inputLabel) // get label from the optionItem for input
    expect(cmp.vm.selectInputDescription).toEqual(appC.settingsC.options.sourceText.items.language.description) // get description from the optionItem

    // not used    
    expect(cmp.vm.checkboxLabel).toBeNull()    

    // check change workflow
    jest.spyOn(cmp.vm.$settingsC, 'changeOption')

    cmp.vm.selectedS = 'ara' // select another from the list
    cmp.vm.changeOption()
    
    expect(appC.settingsC.options.sourceText.items.language.currentValue).toEqual('ara')
    expect(cmp.vm.$settingsC.changeOption).toHaveBeenLastCalledWith(cmp.vm.optionItem)
    expect(cmp.emitted()['updateData']).toBeFalsy()

    cmp.vm.selectedI = 'test' // select another from the list
    cmp.vm.changeOption()
    
    expect(appC.settingsC.options.sourceText.items.language.currentValue).toEqual('test')
    expect(cmp.vm.$settingsC.changeOption).toHaveBeenLastCalledWith(cmp.vm.optionItem)
    expect(cmp.emitted()['updateData']).toBeFalsy()
  })
})
