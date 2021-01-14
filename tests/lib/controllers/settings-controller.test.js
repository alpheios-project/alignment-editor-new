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
    const settingsC = new SettingsController(appC.store)

    expect(settingsC.store).toEqual(expect.any(Vuex.Store))
    expect(settingsC.storageAdapter).toEqual(LocalStorageArea)

    expect(settingsC.options.app).toEqual(expect.any(Options))
    expect(settingsC.options.sourceText).toEqual(expect.any(Options))
  })

  it('2 SettingsController - themeOptionValue returns current theme option value', () => {
    const settingsC = new SettingsController(appC.store)

    expect(settingsC.options.app.items.theme.currentValue).toEqual('v1-theme')
    expect(settingsC.themeOptionValue).toEqual('v1-theme')
  })

  it('3 SettingsController - tokenizerOptionValue returns current tokenizer option value', () => {
    const settingsC = new SettingsController(appC.store)

    expect(settingsC.options.app.items.tokenizer.currentValue).toEqual('alpheiosRemoteTokenizer')
    expect(settingsC.tokenizerOptionValue).toEqual('alpheiosRemoteTokenizer')
  })

  it('4 SettingsController - tokenizerOptionsLoaded returns value depending on tokenizerOptionValue', async () => {
    const settingsC = new SettingsController(appC.store)

    // does not need options
    settingsC.options.app.items.tokenizer.currentValue = 'simpleLocalTokenizer'

    expect(settingsC.tokenizerOptionValue).toEqual('simpleLocalTokenizer')
    expect(settingsC.tokenizerOptionsLoaded).toBeTruthy()
    
    // does need options
    settingsC.options.app.items.tokenizer.currentValue = 'alpheiosRemoteTokenizer'

    expect(settingsC.tokenizerOptionValue).toEqual('alpheiosRemoteTokenizer')
    expect(settingsC.tokenizerOptionsLoaded).toBeFalsy()

    settingsC.options.tokenize = fixtureForRemoteSettings()
    expect(settingsC.tokenizerOptionsLoaded).toBeTruthy()
  })

  it('5 SettingsController - sourceTextOptionsLoaded returns true if options are defined', () => {
    const settingsC = new SettingsController(appC.store)

    expect(settingsC.sourceTextOptionsLoaded).toBeTruthy()

    settingsC.options = {}
    expect(settingsC.sourceTextOptionsLoaded).toBeFalsy()
  })

  it('6 SettingsController - submitEventUpdateTheme submits an event for changing theme', () => {
    const settingsC = new SettingsController(appC.store)

    jest.spyOn(SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED, 'pub')
    settingsC.submitEventUpdateTheme()

    expect(SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.pub).toHaveBeenLastCalledWith({
      theme: 'v1-theme',
      themesList: ['standard-theme', 'v1-theme']
    })
  })

  it('7 SettingsController - init - loads options from storage and emit event for the theme', async () => {
    const settingsC = new SettingsController(appC.store)

    jest.spyOn(settingsC.options.app, 'load')
    jest.spyOn(settingsC.options.sourceText, 'load')
    jest.spyOn(SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED, 'pub')

    await settingsC.init()
    expect(settingsC.options.app.load).toHaveBeenCalled()
    expect(settingsC.options.sourceText.load).toHaveBeenCalled()
    expect(SettingsController.evt.SETTINGS_CONTROLLER_THEME_UPDATED.pub).toHaveBeenCalled()
  })

  it('8 SettingsController - uploadRemoteSettings - uploads options for tokenize workflow', async () => {
    const settingsC = new SettingsController(appC.store)
    expect(settingsC.tokenizerOptionValue).toEqual('alpheiosRemoteTokenizer')

    expect(settingsC.options.tokenize).not.toBeDefined()

    await settingsC.uploadRemoteSettings()

    expect(settingsC.options.tokenize.alpheiosRemoteTokenizer.text).toEqual(expect.any(Options))
    expect(settingsC.options.tokenize.alpheiosRemoteTokenizer.tei).toEqual(expect.any(Options))
  })

  it('9 SettingsController - changeOption - executes actions on changing options - theme, tokenizer', async () => {
    const settingsC = new SettingsController(appC.store)

    jest.spyOn(settingsC, 'submitEventUpdateTheme')
    jest.spyOn(settingsC.store, 'commit')

    const themeOption = settingsC.options.app.items.theme // has specific action
    const tokenizerOption = settingsC.options.app.items.tokenizer // has specific action

    const sourceOption = settingsC.options.sourceText.items.sourceType // no specific action

    settingsC.changeOption(themeOption)

    expect(settingsC.submitEventUpdateTheme).toHaveBeenCalled()
    expect(settingsC.store.commit).toHaveBeenCalledWith('incrementOptionsUpdated')

    settingsC.changeOption(tokenizerOption)

    expect(settingsC.store.commit).toHaveBeenCalledWith('incrementTokenizerUpdated')
    expect(settingsC.store.commit).toHaveBeenCalledWith('incrementOptionsUpdated')

    settingsC.changeOption(sourceOption)

    expect(settingsC.store.commit).toHaveBeenCalledWith('incrementOptionsUpdated')
  })

  it('10 SettingsController - cloneTextEditorOptions - clones options for the source text instance', async () => {
    const settingsC = new SettingsController(appC.store)
    await settingsC.init()
    settingsC.options.tokenize = fixtureForRemoteSettings()

    const resultOptions = await settingsC.cloneTextEditorOptions('origin', 0)

    expect(resultOptions.sourceText).toEqual(expect.any(Options))
    expect(resultOptions.tei).toEqual(expect.any(Options))
    expect(resultOptions.text).toEqual(expect.any(Options))

    expect(resultOptions.sourceText.domain).toEqual('alpheios-alignment-editor-source-text-origin-0')
    expect(resultOptions.tei.domain).toEqual('alpheios-remote-tokenization-tei-origin-0')
    expect(resultOptions.text.domain).toEqual('alpheios-remote-tokenization-text-origin-0')
  })

  it('10 SettingsController - updateLocalTextEditorOptions - sets currentValue for local options - language, direction, sourceType', async () => {
    const settingsC = new SettingsController(appC.store)
    await settingsC.init()
    settingsC.options.tokenize = fixtureForRemoteSettings()

    const resultOptions = await settingsC.cloneTextEditorOptions('origin', 0)

    expect(resultOptions.sourceText.items.language.currentValue).toEqual('eng')
    expect(resultOptions.sourceText.items.direction.currentValue).toEqual('ltr')
    expect(resultOptions.sourceText.items.sourceType.currentValue).toEqual('text')

    settingsC.updateLocalTextEditorOptions(resultOptions, {
      lang: 'ara',
      direction: 'rtl',
      sourceType: 'tei'
    })

    expect(resultOptions.sourceText.items.language.currentValue).toEqual('ara')
    expect(resultOptions.sourceText.items.direction.currentValue).toEqual('rtl')
    expect(resultOptions.sourceText.items.sourceType.currentValue).toEqual('tei')
  })

  it('11 SettingsController - allowUpdateTokenWordOptionValue returns current allowUpdateTokenWord option value', () => {
    const settingsC = new SettingsController(appC.store)

    expect(settingsC.options.app.items.allowUpdateTokenWord.currentValue).toBeFalsy()
    expect(settingsC.allowUpdateTokenWordOptionValue).toBeFalsy()
  })

  it('12 SettingsController - resetLocalTextEditorOptions - reset local options to initial', async () => {
    const settingsC = new SettingsController(appC.store)
    await settingsC.init()

    settingsC.options.tokenize = fixtureForRemoteSettings()

    const resultOptions = await settingsC.cloneTextEditorOptions('origin', 0)

    await resultOptions.sourceText.reset()

    expect(resultOptions.sourceText.items.language.currentValue).toEqual('eng')
    expect(resultOptions.sourceText.items.direction.currentValue).toEqual('ltr')
    expect(resultOptions.sourceText.items.sourceType.currentValue).toEqual('text')

    settingsC.updateLocalTextEditorOptions(resultOptions, {
      lang: 'ara',
      direction: 'rtl',
      sourceType: 'tei'
    })

    expect(resultOptions.sourceText.items.language.currentValue).toEqual('ara')
    expect(resultOptions.sourceText.items.direction.currentValue).toEqual('rtl')
    expect(resultOptions.sourceText.items.sourceType.currentValue).toEqual('tei')

    await settingsC.resetLocalTextEditorOptions(resultOptions)

    expect(resultOptions.sourceText.items.language.currentValue).toEqual('eng')
    expect(resultOptions.sourceText.items.direction.currentValue).toEqual('ltr')
    expect(resultOptions.sourceText.items.sourceType.currentValue).toEqual('text')
  })

  it('13 SettingsController - resetAllOptions - reset global options to initial', async () => {
    const settingsC = new SettingsController(appC.store)
    await settingsC.init()

    await settingsC.options.app.reset()
    await settingsC.options.sourceText.reset()

    settingsC.options.app.items.theme.setValue('standard-theme')
    settingsC.options.app.items.tokenizer.setValue('simpleLocalTokenizer')
    settingsC.options.app.items.allowUpdateTokenWord.setValue(true)

    settingsC.options.sourceText.items.language.setValue('ara')
    settingsC.options.sourceText.items.direction.setValue('rtl')
    settingsC.options.sourceText.items.sourceType.setValue('tei')

    expect(settingsC.options.app.items.theme.currentValue).toEqual('standard-theme')
    expect(settingsC.options.app.items.tokenizer.currentValue).toEqual('simpleLocalTokenizer')
    expect(settingsC.options.app.items.allowUpdateTokenWord.currentValue).toEqual(true)

    expect(settingsC.options.sourceText.items.language.currentValue).toEqual('ara')
    expect(settingsC.options.sourceText.items.direction.currentValue).toEqual('rtl')
    expect(settingsC.options.sourceText.items.sourceType.currentValue).toEqual('tei')

    await settingsC.resetAllOptions()

    expect(settingsC.options.app.items.theme.currentValue).toEqual('v1-theme')
    expect(settingsC.options.app.items.tokenizer.currentValue).toEqual('alpheiosRemoteTokenizer')
    expect(settingsC.options.app.items.allowUpdateTokenWord.currentValue).toEqual(false)

    expect(settingsC.options.sourceText.items.language.currentValue).toEqual('eng')
    expect(settingsC.options.sourceText.items.direction.currentValue).toEqual('ltr')
    expect(settingsC.options.sourceText.items.sourceType.currentValue).toEqual('text')
  })
})
