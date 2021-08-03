/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import AppController from '@/lib/controllers/app-controller.js'
import AnnotationBlock from '@/vue/align-editor/annotation-block.vue'
import LatEng from '@tests/lib/storage/alignments/lat-eng-short.json'
import Alignment from '@/lib/data/alignment'
import Vuex from "vuex"

const localVue = createLocalVue()
localVue.use(Vuex)

describe('annotation-block.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  let alignment, appC, token
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
    appC.defineHistoryController(appC.store)

    alignment = Alignment.convertFromJSON(LatEng)
    appC.textC.alignment = alignment
    appC.historyC.startTracking(appC.textC.alignment)
    appC.alignedGC.alignment = alignment

    token = appC.alignedGC.allAlignedTextsSegments[0].origin.tokens[0]
  })

  it('1 AnnotationBlock - renders a vue instance (min requirements)', () => {
    let cmp = shallowMount(AnnotationBlock, {
      store: appC.store,
      localVue,
      propsData: {
        token: token
      }
    })
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('2 AnnotationBlock - allAnnotations, hasAnnotations, countAnnotations', () => {
    let cmp = shallowMount(AnnotationBlock, {
      store: appC.store,
      localVue,
      propsData: {
        token: token
      }
    })
    expect(cmp.vm.allAnnotations).toEqual([])
    expect(cmp.vm.hasAnnotations).toBeFalsy()
    expect(cmp.vm.countAnnotations).toEqual(0)

    appC.textC.addAnnotation({
      token,
      text: 'First test annotation',
      type: 'Comment'
    })

    expect(cmp.vm.allAnnotations.length).toEqual(1)
    expect(cmp.vm.hasAnnotations).toBeTruthy()
    expect(cmp.vm.countAnnotations).toEqual(1)
  })

  it('3 AnnotationBlock - add a new annotation', () => {
    let cmp = shallowMount(AnnotationBlock, {
      store: appC.store,
      localVue,
      propsData: {
        token: token
      }
    })

    expect(cmp.vm.currentState).toEqual('new')

    cmp.setData({
      annotationText: 'First test annotation',
      annotationType: 'COMMENT'
    })

    cmp.vm.saveAnnotation()

    expect(cmp.vm.currentState).toEqual('list')
    expect(cmp.vm.hasAnnotations).toBeTruthy()
    expect(cmp.vm.countAnnotations).toEqual(1)
  })

  it('4 AnnotationBlock - see annotation journal if annotations are already existed', () => {
    appC.textC.addAnnotation({
      token,
      text: 'First test annotation',
      type: 'Comment'
    })

    let cmp = shallowMount(AnnotationBlock, {
      store: appC.store,
      localVue,
      propsData: {
        token: token
      }
    })

    expect(cmp.vm.currentState).toEqual('list')
    expect(cmp.vm.hasAnnotations).toBeTruthy()
    expect(cmp.vm.countAnnotations).toEqual(1)
  })

  it('5 AnnotationBlock - edit an existed annotation', () => {
    appC.textC.addAnnotation({
      token,
      text: 'First test annotation',
      type: 'Comment'
    })

    let cmp = shallowMount(AnnotationBlock, {
      store: appC.store,
      localVue,
      propsData: {
        token: token
      }
    })

    // as we have already annotations - then we see a list on open
    expect(cmp.vm.currentState).toEqual('list')
    const annot = cmp.vm.allAnnotations[0]

    expect(annot.text).toEqual('First test annotation')

    // let's edit text of the annotation
    cmp.vm.editAnnotation(annot)

    expect(cmp.vm.annotationId).toEqual(annot.id)
    expect(cmp.vm.annotationType).toEqual(annot.type)
    expect(cmp.vm.annotationText).toEqual(annot.text)

    expect(cmp.vm.currentState).toEqual('edit')

    cmp.setData({
      annotationText: 'Second test annotation'
    })

    // let's save the annotation
    cmp.vm.saveAnnotation()
    expect(cmp.vm.currentState).toEqual('list')
    expect(annot.text).toEqual('Second test annotation')
  })

  it('6 AnnotationBlock - delete an existed annotation', () => {
    appC.textC.addAnnotation({
      token,
      text: 'First test annotation',
      type: 'Comment'
    })

    let cmp = shallowMount(AnnotationBlock, {
      store: appC.store,
      localVue,
      propsData: {
        token: token
      }
    })

    expect(cmp.vm.currentState).toEqual('list')
    const annot = cmp.vm.allAnnotations[0]

    // let's delete text of the annotation
    cmp.vm.deleteAnnotation(annot)

    expect(cmp.vm.currentState).toEqual('list')
    expect(cmp.vm.hasAnnotations).toBeFalsy()
    expect(cmp.vm.countAnnotations).toEqual(0)
  })

  it('7 AnnotationBlock - change states', () => {
    let cmp = shallowMount(AnnotationBlock, {
      store: appC.store,
      localVue,
      propsData: {
        token: token
      }
    })

    // starts from new
    expect(cmp.vm.currentState).toEqual('new')

    // switched to journal
    cmp.vm.showAnnotationsJournal()

    expect(cmp.vm.currentState).toEqual('list')
    expect(cmp.vm.annotationId).toBeNull()
    expect(cmp.vm.annotationText).toEqual('')

    // switch to add a new
    cmp.vm.showNewAnnotation()
    expect(cmp.vm.currentState).toEqual('new')
    expect(cmp.vm.annotationId).toBeNull()
    expect(cmp.vm.annotationText).toEqual('')

    cmp.setData({
      annotationText: 'First test annotation',
      annotationType: 'COMMENT'
    })

    // save and return to list
    cmp.vm.saveAnnotation()
    expect(cmp.vm.currentState).toEqual('list')

    const annot = cmp.vm.allAnnotations[0]

    // let's edit
    cmp.vm.editAnnotation(annot)
    expect(cmp.vm.currentState).toEqual('edit')
  })
})
