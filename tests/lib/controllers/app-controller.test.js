/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import TextsController from '@/lib/controllers/texts-controller.js'
import AlignedController from '@/lib/controllers/aligned-controller.js'
import Vue from '@vue-runtime'
import L10n from '@/lib/l10n/l10n.js'

describe('app-controller.test.js', () => {

  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  beforeAll(() => {
    const divEl = document.createElement('div')
    divEl.id = 'alpheios-alignment-editor'
    document.body.appendChild(divEl)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')

    Vue.prototype.$textC = undefined
    Vue.prototype.$alignedC = undefined
    Vue.prototype.$l10n = undefined
  })

  function timeout (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }


  it('1 AppController - creates AppController and uploads appId from parameters', () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    expect(appC).toHaveProperty('appId', 'alpheios-alignment-editor')
  })

  it('2 AppController - print an error to console if appId is not passed via parameters', () => {
    const appC = new AppController({})

    expect(console.error).toHaveBeenCalled()
  })

  it('3 AppController - init method executes attachVueComponents only if appId is defined', () => {
    const appC_correct = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    appC_correct.attachVueComponents = jest.fn()
    appC_correct.init()

    expect(appC_correct.attachVueComponents).toHaveBeenCalled()

    const appC_incorrect = new AppController({})
  
    appC_incorrect.attachVueComponents = jest.fn()
    appC_incorrect.init()
    expect(appC_incorrect.attachVueComponents).not.toHaveBeenCalled()
  })

  it('4 AppController - attachVueComponents executes defineL10Support, defineTextController, defineAlignedController and attaches App Vue component ', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    jest.spyOn(appC, 'defineL10Support')
    jest.spyOn(appC, 'defineTextController')
    jest.spyOn(appC, 'defineAlignedController')

    appC.init()

    expect(appC.defineL10Support).toHaveBeenCalled()
    expect(appC.defineTextController).toHaveBeenCalled()
    expect(appC.defineAlignedController).toHaveBeenCalled()

    const divAppVue = document.getElementById('alpheios-alignment-app-container')   
    expect(divAppVue).toBeDefined()
  })

  it('5 AppController - defineTextController creates TextController and attaches it to Vue component ', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    appC.attachVueComponents = jest.fn()
    appC.init()

    expect(appC.textC).not.toBeDefined()
    expect(Vue.prototype.$textC).not.toBeDefined()

    appC.defineTextController()

    expect(appC.textC).toBeInstanceOf(TextsController)
    expect(Vue.prototype.$textC).toBeInstanceOf(TextsController)
  })

  it('6 AppController - defineAlignedController creates AlignedController and attaches it to Vue component ', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    appC.attachVueComponents = jest.fn()
    appC.init()

    expect(appC.alignedC).not.toBeDefined()
    expect(Vue.prototype.$alignedC).not.toBeDefined()

    appC.defineAlignedController()

    expect(appC.alignedC).toBeInstanceOf(AlignedController)
    expect(Vue.prototype.$alignedC).toBeInstanceOf(AlignedController)
  })

  it('7 AppController - defineL10Support creates L10n and attaches it to Vue component ', async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })

    appC.attachVueComponents = jest.fn()

    const result = appC.defineL10Support()

    expect(result).toBeInstanceOf(L10n)
  })
})
