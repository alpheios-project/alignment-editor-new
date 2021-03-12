/* eslint-env jest */
/* eslint-disable no-unused-vars */
import { shallowMount, mount, createLocalVue } from '@vue/test-utils'

import TestData from '@tests/_output/utility/test-data.json'
import App from '@/_output/vue/app.vue'

import AlGroupsViewFull from '@/_output/vue/views/al-groups-view-full.vue'
import AlGroupsViewShort from '@/_output/vue/views/al-groups-view-short.vue'
import AlGroupsViewSentence from '@/_output/vue/views/al-groups-view-sentence.vue'
import AlGroupsViewEquivalence from '@/_output/vue/views/al-groups-view-equivalence.vue'
import AlGroupsViewColumns from '@/_output/vue/views/al-groups-view-columns.vue'

import Vue from '@vue-runtime'

let appC

describe('app.test.js', () => {
  // console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  beforeEach(async () => {
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')

  })

  it('1 App - renders a vue instance (min requirements)', () => {
    const fullData = TestData

    const ParentVm  = mount({
      template: '<div />',
      data() {
        return { fullData }
      }
    }).vm

    let cmp = shallowMount(App, {
      created() {
        this.$parent = ParentVm
      }
    })

    expect(cmp.vm).toBeTruthy()
    expect(cmp.vm.$parent.fullData).toEqual(expect.objectContaining({
      origin: expect.any(Object),
      targets: expect.any(Object)
    }))
  })

  it('2 App - includes all display views and renders one at a time - fullView ', async () => {
    const fullData = TestData

    const ParentVm  = mount({
      template: '<div />',
      data() {
        return { fullData }
      }
    }).vm

    let cmp = shallowMount(App, {
      created() {
        this.$parent = ParentVm
      }
    })

    await cmp.setData({ viewType: 'viewFull' })
    expect(cmp.findComponent(AlGroupsViewFull).exists()).toBeTruthy()

    expect(cmp.findComponent(AlGroupsViewShort).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewSentence).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewEquivalence).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewColumns).exists()).toBeFalsy()
  })

  it('3 App - includes all display views and renders one at a time - viewShort ', async () => {
    const fullData = TestData

    const ParentVm  = mount({
      template: '<div />',
      data() {
        return { fullData }
      }
    }).vm

    let cmp = shallowMount(App, {
      created() {
        this.$parent = ParentVm
      }
    })

    await cmp.setData({ viewType: 'viewShort' })

    expect(cmp.findComponent(AlGroupsViewFull).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewShort).exists()).toBeTruthy()
    expect(cmp.findComponent(AlGroupsViewSentence).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewEquivalence).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewColumns).exists()).toBeFalsy()
  })

  it('4 App - includes all display views and renders one at a time - viewSentence ', async () => {
    const fullData = TestData

    const ParentVm  = mount({
      template: '<div />',
      data() {
        return { fullData }
      }
    }).vm

    let cmp = shallowMount(App, {
      created() {
        this.$parent = ParentVm
      }
    })

    await cmp.setData({ viewType: 'viewSentence' })

    expect(cmp.findComponent(AlGroupsViewFull).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewShort).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewSentence).exists()).toBeTruthy()
    expect(cmp.findComponent(AlGroupsViewEquivalence).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewColumns).exists()).toBeFalsy()
  })

  it('5 App - includes all display views and renders one at a time - viewEquivalence ', async () => {
    const fullData = TestData

    const ParentVm  = mount({
      template: '<div />',
      data() {
        return { fullData }
      }
    }).vm

    let cmp = shallowMount(App, {
      created() {
        this.$parent = ParentVm
      }
    })

    await cmp.setData({ viewType: 'viewEquivalence' })

    expect(cmp.findComponent(AlGroupsViewFull).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewShort).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewSentence).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewEquivalence).exists()).toBeTruthy()
    expect(cmp.findComponent(AlGroupsViewColumns).exists()).toBeFalsy()
  })

  it('6 App - includes all display views and renders one at a time - view3Columns ', async () => {
    const fullData = TestData

    const ParentVm  = mount({
      template: '<div />',
      data() {
        return { fullData }
      }
    }).vm

    let cmp = shallowMount(App, {
      created() {
        this.$parent = ParentVm
      }
    })

    await cmp.setData({ viewType: 'view3Columns' })

    expect(cmp.findComponent(AlGroupsViewFull).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewShort).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewSentence).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewEquivalence).exists()).toBeFalsy()
    expect(cmp.findComponent(AlGroupsViewColumns).exists()).toBeTruthy()
  })

  it('7 App - sentenceCount could not be less then 0 ', async () => {
    const fullData = TestData

    const ParentVm  = mount({
      template: '<div />',
      data() {
        return { fullData }
      }
    }).vm

    let cmp = shallowMount(App, {
      created() {
        this.$parent = ParentVm
      }
    })

    await cmp.setData({ sentenceCount: -5 })
    cmp.vm.checkSentenceCount()

    expect(cmp.vm.sentenceCount).toEqual(0)

    await cmp.setData({ sentenceCount: 2 })
    expect(cmp.vm.sentenceCount).toEqual(2)
  })
})
