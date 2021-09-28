/* eslint-env jest */
/* eslint-disable no-unused-vars */

import SettingsController from '@/lib/controllers/settings-controller.js'
import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'
import { LocalStorageArea, Options } from 'alpheios-data-models'

import Vuex from 'vuex'

describe('settings-controller.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  let appC
  beforeAll(() => {
    appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
  })

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
        text: new Options(defaultsText, new LocalStorageArea('alpheios-remote-tokenization-text')),
        tei: new Options(defaultsTei, new LocalStorageArea('alpheios-remote-tokenization-tei')) 
      }
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 SettingsController - constructor defines all base options ', () => {
    SettingsController.create(appC.store)

    expect(SettingsController.getStorageAdapter()).toEqual(LocalStorageArea)

    expect(SettingsController.allOptions.app).toEqual(expect.any(Options))
    expect(SettingsController.allOptions.sourceText).toEqual(expect.any(Options))
  })

  it('2 SettingsController - themeOptionValue returns current theme option value', () => {
    SettingsController.create(appC.store)

    expect(SettingsController.allOptions.app.items.theme.currentValue).toEqual('v1-theme')
    expect(SettingsController.themeOptionValue).toEqual('v1-theme')
  })

  it('3 SettingsController - tokenizerOptionValue returns current tokenizer option value', () => {
    SettingsController.create(appC.store)

    expect(SettingsController.allOptions.app.items.tokenizer.currentValue).toEqual('alpheiosRemoteTokenizer')
    expect(SettingsController.tokenizerOptionValue).toEqual('alpheiosRemoteTokenizer')
  })

  it('4 SettingsController - tokenizerOptionsLoaded returns value depending on tokenizerOptionValue', async () => {
    SettingsController.create(appC.store)

    // does not need options
    SettingsController.allOptions.app.items.tokenizer.currentValue = 'simpleLocalTokenizer'

    expect(SettingsController.tokenizerOptionValue).toEqual('simpleLocalTokenizer')
    expect(SettingsController.tokenizerOptionsLoaded).toBeTruthy()
    
    // does need options
    SettingsController.allOptions.app.items.tokenizer.currentValue = 'alpheiosRemoteTokenizer'

    expect(SettingsController.tokenizerOptionValue).toEqual('alpheiosRemoteTokenizer')
    expect(SettingsController.tokenizerOptionsLoaded).toBeFalsy()

    SettingsController.allOptions.tokenize = fixtureForRemoteSettings()
    expect(SettingsController.tokenizerOptionsLoaded).toBeTruthy()
  })

  it('5 SettingsController - sourceTextOptionsLoaded returns true if options are defined', () => {
    SettingsController.create(appC.store)

    expect(SettingsController.sourceTextOptionsLoaded).toBeTruthy()

    SettingsController.allOptions.sourceText = null
    expect(SettingsController.sourceTextOptionsLoaded).toBeFalsy()
  })

  it('6 SettingsController - submitEventUpdateTheme submits an event for changing theme', () => {
    SettingsController.create(appC.store)

    jest.spyOn(SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED, 'pub')
    SettingsController.submitEventUpdateTheme()

    expect(SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.pub).toHaveBeenLastCalledWith({
      theme: 'v1-theme',
      themesList: ['standard-theme', 'v1-theme']
    })
  })

  it('7 SettingsController - init - loads options from storage and emit event for the theme', async () => {
    SettingsController.create(appC.store)

    jest.spyOn(SettingsController.allOptions.app, 'load')
    jest.spyOn(SettingsController.allOptions.sourceText, 'load')
    jest.spyOn(SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED, 'pub')

    await SettingsController.init()
    expect(SettingsController.allOptions.app.load).toHaveBeenCalled()
    expect(SettingsController.allOptions.sourceText.load).toHaveBeenCalled()
    expect(SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.pub).toHaveBeenCalled()
  })

  it('8 SettingsController - uploadRemoteSettings - uploads options for tokenize workflow', async () => {
    SettingsController.create(appC.store)
    expect(SettingsController.tokenizerOptionValue).toEqual('alpheiosRemoteTokenizer')

    expect(SettingsController.allOptions.tokenize).not.toBeDefined()

    await SettingsController.uploadRemoteSettings()

    expect(SettingsController.allOptions.tokenize.alpheiosRemoteTokenizer.text).toEqual(expect.any(Options))
    expect(SettingsController.allOptions.tokenize.alpheiosRemoteTokenizer.tei).toEqual(expect.any(Options))
  })

  it('9 SettingsController - changeOption - executes actions on changing options - theme, tokenizer', async () => {
    SettingsController.create(appC.store)

    jest.spyOn(SettingsController, 'submitEventUpdateTheme')
    jest.spyOn(SettingsController.getStore(), 'commit')

    const themeOption = SettingsController.allOptions.app.items.theme // has specific action
    const tokenizerOption = SettingsController.allOptions.app.items.tokenizer // has specific action

    const sourceOption = SettingsController.allOptions.sourceText.items.sourceType // no specific action

    SettingsController.changeOption(themeOption)

    expect(SettingsController.submitEventUpdateTheme).toHaveBeenCalled()
    expect(SettingsController.getStore().commit).toHaveBeenCalledWith('incrementOptionsUpdated')

    SettingsController.changeOption(tokenizerOption)

    expect(SettingsController.getStore().commit).toHaveBeenCalledWith('incrementOptionsUpdated')

    SettingsController.changeOption(sourceOption)

    expect(SettingsController.getStore().commit).toHaveBeenCalledWith('incrementOptionsUpdated')
  })

  it('10 SettingsController - cloneTextEditorOptions - clones options for the source text instance', async () => {
    SettingsController.create(appC.store)
    await SettingsController.init()
    SettingsController.allOptions.tokenize = fixtureForRemoteSettings()

    const resultOptions = await SettingsController.cloneTextEditorOptions('origin', 0)

    expect(resultOptions.sourceText).toEqual(expect.any(Options))
    expect(resultOptions.tei).toEqual(expect.any(Options))
    expect(resultOptions.text).toEqual(expect.any(Options))

    expect(resultOptions.sourceText.domain).toEqual('alpheios-alignment-editor-source-text-origin-0')
    expect(resultOptions.tei.domain).toEqual('alpheios-remote-tokenization-tei-origin-0')
    expect(resultOptions.text.domain).toEqual('alpheios-remote-tokenization-text-origin-0')
  })

  it('11 SettingsController - updateLocalTextEditorOptions - sets currentValue for local options - language, direction, sourceType', async () => {
    SettingsController.create(appC.store)
    await SettingsController.init()
    SettingsController.allOptions.tokenize = fixtureForRemoteSettings()

    const resultOptions = await SettingsController.cloneTextEditorOptions('origin', 0)

    expect(resultOptions.sourceText.items.language.currentValue).toEqual('eng')
    expect(resultOptions.sourceText.items.direction.currentValue).toEqual('ltr')
    expect(resultOptions.sourceText.items.sourceType.currentValue).toEqual('text')

    SettingsController.updateLocalTextEditorOptions(resultOptions, {
      lang: 'ara',
      direction: 'rtl',
      sourceType: 'tei'
    })

    expect(resultOptions.sourceText.items.language.currentValue).toEqual('ara')
    expect(resultOptions.sourceText.items.direction.currentValue).toEqual('rtl')
    expect(resultOptions.sourceText.items.sourceType.currentValue).toEqual('tei')
  })

  it('12 SettingsController - allowUpdateTokenWordOptionValue returns current allowUpdateTokenWord option value', () => {
    SettingsController.create(appC.store)

    expect(SettingsController.allOptions.app.items.allowUpdateTokenWord.currentValue).toBeTruthy()
    expect(SettingsController.allowUpdateTokenWordOptionValue).toBeTruthy()
  })

  it('13 SettingsController - resetLocalTextEditorOptions - reset local options to initial', async () => {
    SettingsController.create(appC.store)
    await SettingsController.init()

    SettingsController.allOptions.tokenize = fixtureForRemoteSettings()

    let resultOptions = await SettingsController.cloneTextEditorOptions('origin', 0)

    expect(resultOptions.sourceText.items.language.currentValue).toEqual('eng')
    expect(resultOptions.sourceText.items.direction.currentValue).toEqual('ltr')
    expect(resultOptions.sourceText.items.sourceType.currentValue).toEqual('text')

    SettingsController.updateLocalTextEditorOptions(resultOptions, {
      lang: 'ara',
      direction: 'rtl',
      sourceType: 'tei'
    })

    expect(resultOptions.sourceText.items.language.currentValue).toEqual('ara')
    expect(resultOptions.sourceText.items.direction.currentValue).toEqual('rtl')
    expect(resultOptions.sourceText.items.sourceType.currentValue).toEqual('tei')

    resultOptions = SettingsController.resetLocalTextEditorOptions('origin', 0)

    expect(resultOptions.sourceText.items.language.currentValue).toEqual('eng')
    expect(resultOptions.sourceText.items.direction.currentValue).toEqual('ltr')
    expect(resultOptions.sourceText.items.sourceType.currentValue).toEqual('text')
  })

  it('14 SettingsController - resetAllOptions - reset global options to initial', async () => {
    SettingsController.create(appC.store)
    await SettingsController.init()

    await SettingsController.allOptions.app.reset()
    await SettingsController.allOptions.sourceText.reset()

    SettingsController.allOptions.app.items.theme.setValue('standard-theme')
    SettingsController.allOptions.app.items.tokenizer.setValue('simpleLocalTokenizer')
    SettingsController.allOptions.app.items.allowUpdateTokenWord.setValue(true)

    SettingsController.allOptions.sourceText.items.language.setValue('ara')
    SettingsController.allOptions.sourceText.items.direction.setValue('rtl')
    SettingsController.allOptions.sourceText.items.sourceType.setValue('tei')

    expect(SettingsController.allOptions.app.items.theme.currentValue).toEqual('standard-theme')
    expect(SettingsController.allOptions.app.items.tokenizer.currentValue).toEqual('simpleLocalTokenizer')
    expect(SettingsController.allOptions.app.items.allowUpdateTokenWord.currentValue).toEqual(true)

    expect(SettingsController.allOptions.sourceText.items.language.currentValue).toEqual('ara')
    expect(SettingsController.allOptions.sourceText.items.direction.currentValue).toEqual('rtl')
    expect(SettingsController.allOptions.sourceText.items.sourceType.currentValue).toEqual('tei')

    await SettingsController.resetAllOptions()

    expect(SettingsController.allOptions.app.items.theme.currentValue).toEqual('v1-theme')
    expect(SettingsController.allOptions.app.items.tokenizer.currentValue).toEqual('alpheiosRemoteTokenizer')
    expect(SettingsController.allOptions.app.items.allowUpdateTokenWord.currentValue).toEqual(true)

    expect(SettingsController.allOptions.sourceText.items.language.currentValue).toEqual('eng')
    expect(SettingsController.allOptions.sourceText.items.direction.currentValue).toEqual('ltr')
    expect(SettingsController.allOptions.sourceText.items.sourceType.currentValue).toEqual('text')
  })

})
