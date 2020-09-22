/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import App from '@/vue/app.vue'
import AppController from '@/lib/controllers/app-controller.js'

describe('aligned-text.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  beforeAll(() => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })
    appC.defineL10Support()
    appC.defineTextController()
    appC.defineAlignedController()
    appC.defineHistoryController()
  })
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })
  
  it.skip('1 Workflow', () => {
    // create alignment
    let cmp = shallowMount(App)

    const alignment = cmp.vm.$textC.createAlignment()
    cmp.vm.$historyC.startTracking(alignment)

    //upload doc sources
    const fileData = `Capuam colonis deductis occupabunt, Atellam praesidio communient, Nuceriam, Cumas multitudine suorum obtinebunt, cetera oppida praesidiis devincient.		Venibit igitur sub praecone tota Propontis atque Hellespontus, addicetur omnis ora Lyciorum atque Cilicum, Mysia et Phrygia eidem condicioni legique parebunt.		Humano capiti cervicem pictor equinam	iungere si velit, et varias inducere plumas,	undique conlatis membris, ut turpiter atrum	desinat in piscem mulier formosa superne,	spectatum admissi risum teneatis, amici?
    ltr
    lat
    To a certain extent jointly launching occupabunt, Atellam protection communient, Nuceriam, uses personification the great number of their obtinebunt, the rest of the towns guards devincient.		Will be sold then, under the praecone whole of the Propontis and Hellespontus, addicetur every edge Lyciorum and Cilicum, Bulgaria and the West respond to the circumstances of their legique parebunt.		Human head neck painter equinam join if you choose,	and the various to bring the feathers,	all collected members, to be shamefully dark	it ends up in a fish woman beautiful overhead,	viewed admitted laughter your smiles, your friends?
    ltr
    eng`
    cmp.vm.$textC.uploadDocSourceFromFile(fileData)

    //create aligned texts
    cmp.vm.$alignedC.createAlignedTexts(alignment)

    const targetId = Object.keys(alignment.targets)[0]

    //render aligned editor
    // const resultShowEditor = cmp.vm.$alignedC.allTargetTextsSegments
    console.info(cmp.vm.$alignedC.allTargetTextsSegments)
  })

  it('2 Workflow', () => {
    // create alignment
    let cmp = shallowMount(App)

    const alignment = cmp.vm.$textC.createAlignment()
    cmp.vm.$historyC.startTracking(alignment)

    // update origin text
    cmp.vm.$textC.updateOriginDocSource({
      text: 'origin some text', direction: 'ltr', lang: 'eng'
    })

    cmp.vm.$textC.updateTargetDocSource({
      text: 'target some text', direction: 'ltr', lang: 'eng'
    })

    const fileData = `Capuam colonis deductis occupabunt, Atellam praesidio communient, Nuceriam, Cumas multitudine suorum obtinebunt, cetera oppida praesidiis devincient.
    ltr
    lat
    To a certain extent jointly launching occupabunt, Atellam protection communient, Nuceriam, uses personification the great number of their obtinebunt, the rest of the towns guards devincient.
    ltr
    eng`
    cmp.vm.$textC.uploadDocSourceFromFile(fileData)

    // upload additional 
    // console.info(cmp.vm.$textC.allTargetTextsIds)
    
    const targetId1 = cmp.vm.$textC.allTargetTextsIds[0]
    const targetId2 = cmp.vm.$textC.allTargetTextsIds[1]

    // console.info(targetId1, cmp.vm.$textC.targetDocSource(targetId1))
    // console.info(targetId2, cmp.vm.$textC.targetDocSource(targetId2))
    
    // this.targets[id] && this.targets[id].docSource ? this.targets[id].docSource : {}
    console.info(targetId1, alignment.targets)
  })
})
