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
      appId:'alpheios-alignment-editor',
      tokenizeParams: {
        tokenizer: 'simpleLocalTokenizer'
      }
    })
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
    appC.defineTextController(appC.store)
    appC.defineAlignedController(appC.store)
    appC.defineHistoryController(appC.store)
  })
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  const defineAlinmentWithSource = async (cmp, alignment) => {
    cmp.vm.$historyC.startTracking(alignment)

    // add origin doc source
    cmp.vm.$textC.updateOriginDocSource({
      text: 'Humano capiti cervicem pictor equinam'
    })

    // add the first target doc source
    cmp.vm.$textC.updateTargetDocSource({
      text: 'Human head neck painter equinam',
      lang: 'lat'
    })

    // add the second target doc source
    cmp.vm.$textC.updateTargetDocSource({
      text: 'join if you choose, and the various to bring the feathers,',
      lang: 'lat'
    })

    // create aligned texts
    await cmp.vm.$alignedC.createAlignedTexts(alignment)

  }

  const clickToken = (cmp, alignment, textType, segmentIndex = 0, tokenIndex = 0, targetId = 0) => {
    let testToken
    if (textType === 'origin') {
      testToken = alignment.origin.alignedText.segments[segmentIndex].tokens[tokenIndex]
    } else {
      const allTargetsId = cmp.vm.$textC.allTargetTextsIds

      testToken = alignment.targets[allTargetsId[targetId]].alignedText.segments[segmentIndex].tokens[tokenIndex]
    }

    cmp.vm.$alignedC.clickToken(testToken)
    return testToken
  }
  
  it('1 Multiple targets - add several targets and create aligned texts, create one simple alignmentGroup and check status - selected, grouped, in active', async () => {
    let cmp = shallowMount(App)
    const alignment = cmp.vm.$textC.createAlignment()

    await defineAlinmentWithSource(cmp, alignment)
    const allTargetsId = cmp.vm.$textC.allTargetTextsIds

    const testOriginToken1 = clickToken(cmp, alignment, 'origin', 0, 0)
    expect(alignment.activeAlignmentGroup.origin).toEqual([testOriginToken1.idWord])

    const testTargetToken1 = clickToken(cmp, alignment, 'target', 0, 0, 0)
    expect(alignment.activeAlignmentGroup.target).toEqual([testTargetToken1.idWord])

    // console.info('activeAlignmentGroup - ', alignment.activeAlignmentGroup)

    // check status of tokens in active group
    expect(cmp.vm.$alignedC.tokenInActiveGroup(testOriginToken1)).toBeTruthy() // we see both tabs on the screen
    expect(cmp.vm.$alignedC.tokenInActiveGroup(testTargetToken1)).toBeTruthy() 

    expect(cmp.vm.$alignedC.tokenInActiveGroup(testOriginToken1, allTargetsId[0])).toBeTruthy() // we see the tab, where we start to create a group 
    expect(cmp.vm.$alignedC.tokenInActiveGroup(testTargetToken1, allTargetsId[0])).toBeTruthy() 

    expect(cmp.vm.$alignedC.tokenInActiveGroup(testOriginToken1, allTargetsId[1])).toBeFalsy() // we see the other tab, where we didn't start to create a group 
    expect(cmp.vm.$alignedC.tokenInActiveGroup(testTargetToken1, allTargetsId[1])).toBeFalsy() 

    expect(cmp.vm.$alignedC.isFirstInActiveGroup(testOriginToken1)).toBeTruthy() // we see both tabs on the screen
    expect(cmp.vm.$alignedC.isFirstInActiveGroup(testTargetToken1)).toBeFalsy() 

    expect(cmp.vm.$alignedC.isFirstInActiveGroup(testOriginToken1, allTargetsId[0])).toBeTruthy() // we see the tab, where we start to create a group 
    expect(cmp.vm.$alignedC.isFirstInActiveGroup(testTargetToken1, allTargetsId[0])).toBeFalsy() 

    expect(cmp.vm.$alignedC.isFirstInActiveGroup(testOriginToken1, allTargetsId[1])).toBeFalsy() // we see the other tab, where we didn't start to create a group 
    expect(cmp.vm.$alignedC.isFirstInActiveGroup(testTargetToken1, allTargetsId[1])).toBeFalsy() 

    // click the same token from origin to finish the group
    cmp.vm.$alignedC.clickToken(testOriginToken1)

    expect(alignment.activeAlignmentGroup).toBeNull()
    expect(alignment.alignmentGroups.length).toEqual(1)
    expect(alignment.alignmentGroups[0].allIds).toEqual([testOriginToken1.idWord, testTargetToken1.idWord])

    // now we have saved aligned group, let's check status of tokens
    expect(cmp.vm.$alignedC.tokenInActiveGroup(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.tokenInActiveGroup(testTargetToken1)).toBeFalsy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1)).toBeTruthy()  // we see both tabs on the screen
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1)).toBeTruthy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1, allTargetsId[0])).toBeTruthy()   // we see the tab, where we created a group 
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1, allTargetsId[0])).toBeTruthy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1, allTargetsId[1])).toBeFalsy()   // we see the other tab, where we didn't start to create a group 
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1, allTargetsId[1])).toBeFalsy()


    // let's check hover

    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken1) // we see both tabs on the screen
    expect(alignment.hoveredGroups.length).toEqual(1)
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()
    
    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken1) // we see both tabs on the screen
    expect(alignment.hoveredGroups.length).toEqual(1)
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()

    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()

    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken1, allTargetsId[0]) // we see the tab, where we created a group 
    expect(alignment.hoveredGroups.length).toEqual(1)
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()

    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken1, allTargetsId[1]) // we see the other tab, where we didn't start to create a group 
    expect(alignment.hoveredGroups.length).toEqual(0)
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()

    // console.info('hoveredGroups - ', alignment.hoveredGroups)
  })

  it('2 Multiple targets - create two aligned groups in different target texts', async () => {
    let cmp = shallowMount(App)
    const alignment = cmp.vm.$textC.createAlignment()

    await defineAlinmentWithSource(cmp, alignment)
    const allTargetsId = cmp.vm.$textC.allTargetTextsIds
    
    // created the first group
    const testOriginToken1 = clickToken(cmp, alignment, 'origin', 0, 0, 0)
    const testTargetToken1 = clickToken(cmp, alignment, 'target', 0, 0, 0)
    cmp.vm.$alignedC.clickToken(testOriginToken1, allTargetsId[0])

    // created the second group
    const testOriginToken2 = clickToken(cmp, alignment, 'origin', 0, 1, 1)
    const testTargetToken2 = clickToken(cmp, alignment, 'target', 0, 0, 1)
    cmp.vm.$alignedC.clickToken(testOriginToken2, allTargetsId[1])

    /********************************************************************* */
    // we see the first tab with the first group, no active groups
    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1, allTargetsId[0])).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1, allTargetsId[0])).toBeTruthy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken2, allTargetsId[0])).toBeFalsy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken2, allTargetsId[0])).toBeFalsy()

    // hover on the origin token from the first group - the first group is highlighted, the second is not
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken1, allTargetsId[0])
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    // hover on the target token from the first group - the first group is highlighted, the second is not
    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken1, allTargetsId[0])
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    // hover on the origin token from the second group - noone hovered
    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken2, allTargetsId[0])
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()


    /********************************************************************* */
    // we see the second tab with the second group, no active groups
    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1, allTargetsId[1])).toBeFalsy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1, allTargetsId[1])).toBeFalsy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken2, allTargetsId[1])).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken2, allTargetsId[1])).toBeTruthy()

    // hover on the origin token from the second group - the second group is highlighted, the first is not
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken2, allTargetsId[1])
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()

    // hover on the target token from the second group - the second group is highlighted, the first is not
    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken2, allTargetsId[1])
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()

    // hover on the origin token from the first group - noone is hovered
    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken1, allTargetsId[1])
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    /********************************************************************* */
    // we see both tabs - and see all grouped tokens

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1)).toBeTruthy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken2)).toBeTruthy()

    // hover on the origin token from the first group - the first group is highlighted

    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken1)
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    // hover on the target token from the first group - the first group is highlighted

    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken1)
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    // hover on the origin token from the second group - the second group is highlighted

    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken2)
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()

    // hover on the target token from the second group - the second group is highlighted

    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken2)
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()
  })

  it('3 Multiple targets - create two aligned groups in different target texts with the same origin word', async () => {
    let cmp = shallowMount(App)
    const alignment = cmp.vm.$textC.createAlignment()

    await defineAlinmentWithSource(cmp, alignment)
    const allTargetsId = cmp.vm.$textC.allTargetTextsIds
    
    // created the first group
    const testOriginToken1 = clickToken(cmp, alignment, 'origin', 0, 0)
    const testTargetToken1 = clickToken(cmp, alignment, 'target', 0, 0, 0)
    cmp.vm.$alignedC.clickToken(testOriginToken1, allTargetsId[0])

    // created the second group with the same origin
    cmp.vm.$alignedC.clickToken(testOriginToken1, allTargetsId[1])
    const testTargetToken2 = clickToken(cmp, alignment, 'target', 0, 0, 1)
    cmp.vm.$alignedC.clickToken(testOriginToken1, allTargetsId[1])

    //********************************************************************* 
    // we see the first tab with the first group, no active groups
    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1, allTargetsId[0])).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1, allTargetsId[0])).toBeTruthy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken2, allTargetsId[0])).toBeFalsy()

    // hover on the origin token from the first group - the first group is highlighted, the second is not
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken1, allTargetsId[0])
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    // hover on the target token from the first group - the first group is highlighted, the second is not
    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken1, allTargetsId[0])
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    //********************************************************************* 
    // we see the second tab with the second group, no active groups
    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1, allTargetsId[1])).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1, allTargetsId[1])).toBeFalsy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken2, allTargetsId[1])).toBeTruthy()

    // hover on the origin token from the second group - the second group is highlighted, the first is not
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken1, allTargetsId[1])
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()

    // hover on the target token from the second group - the second group is highlighted, the first is not
    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken2, allTargetsId[1])
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()

    //********************************************************************* 
    // we see both tabs - and see all grouped tokens

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken2)).toBeTruthy()

    // hover on the origin token from the first group - the both group is highlighted
    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken1)
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()

    // hover on the target token from the first group - the first group is highlighted
    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken1)
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    // hover on the target token from the second group - the second group is highlighted
    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken2)
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()

  })

  it('4 Multiple targets - create three aligned groups in different target texts, merge on the same target, don\'t merge on different targets', async () => {
    let cmp = shallowMount(App)
    const alignment = cmp.vm.$textC.createAlignment()

    await defineAlinmentWithSource(cmp, alignment)
    const allTargetsId = cmp.vm.$textC.allTargetTextsIds
    
    // created the first group
    const testOriginToken1 = clickToken(cmp, alignment, 'origin', 0, 0)
    const testTargetToken1 = clickToken(cmp, alignment, 'target', 0, 0, 0)
    
    cmp.vm.$alignedC.clickToken(testOriginToken1, allTargetsId[0])

    // created the second group
    const testOriginToken2 = clickToken(cmp, alignment, 'origin', 0, 1, 1)
    const testTargetToken2 = clickToken(cmp, alignment, 'target', 0, 1, 1)
    
    cmp.vm.$alignedC.clickToken(testOriginToken2, allTargetsId[1])

    // created the third group
    const testOriginToken3 = clickToken(cmp, alignment, 'origin', 0, 2, 1)
    const testTargetToken3 = clickToken(cmp, alignment, 'target', 0, 2, 1)
    // console.info(alignment.activeAlignmentGroup)
    cmp.vm.$alignedC.clickToken(testOriginToken3, allTargetsId[1])

    //********************************************************************* 
    // activate the first group
    cmp.vm.$alignedC.clickToken(testOriginToken1, allTargetsId[0])
    // click on the origin from the second group, that belongs to the another target - should only add this origin
    cmp.vm.$alignedC.clickToken(testOriginToken2, allTargetsId[0])

    expect(alignment.activeAlignmentGroup.origin).toEqual([ 'L1:1-1', 'L1:1-2' ])
    expect(alignment.activeAlignmentGroup.target).toEqual([ 'L2:1-1' ])

   
    // click on the origin from the third group, that belongs to the another target - should only add this origin
    cmp.vm.$alignedC.clickToken(testOriginToken3, allTargetsId[0])
    expect(alignment.activeAlignmentGroup.origin).toEqual([ 'L1:1-1', 'L1:1-2', 'L1:1-3' ])
    expect(alignment.activeAlignmentGroup.target).toEqual([ 'L2:1-1' ])

    //let's add testTargetToken4
    const testTargetToken4 = clickToken(cmp, alignment, 'target', 0, 3, 0)

    expect(alignment.activeAlignmentGroup.origin).toEqual([ 'L1:1-1', 'L1:1-2', 'L1:1-3' ])
    expect(alignment.activeAlignmentGroup.target).toEqual([ 'L2:1-1', 'L2:1-4' ])

    //let's remove testTargetToken4
    cmp.vm.$alignedC.clickToken(testTargetToken4, allTargetsId[0])
    expect(alignment.activeAlignmentGroup.origin).toEqual([ 'L1:1-1', 'L1:1-2', 'L1:1-3' ])
    expect(alignment.activeAlignmentGroup.target).toEqual([ 'L2:1-1' ])

    //finish the first group again
    cmp.vm.$alignedC.clickToken(testOriginToken1, allTargetsId[0])
  
    //********************************************************************* 
    // activate the second group on the second target
    cmp.vm.$alignedC.clickToken(testOriginToken2, allTargetsId[1])

    //merge with the third group on the same target
    cmp.vm.$alignedC.clickToken(testTargetToken3, allTargetsId[1])

    expect(alignment.activeAlignmentGroup.origin).toEqual([ 'L1:1-2', 'L1:1-3' ]) //merged results
    expect(alignment.activeAlignmentGroup.target).toEqual([ 'L3:1-2', 'L3:1-3' ])
  
    // finish the group
    cmp.vm.$alignedC.clickToken(testOriginToken2, allTargetsId[1])

    expect(alignment.alignmentGroups.length).toEqual(2)

    //********************************************************************* 
    //let's check grouped
    // both tabs are activated

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1)).toBeTruthy()
    
    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken2)).toBeTruthy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken3)).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken3)).toBeTruthy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken4)).toBeFalsy()

    // the first tab is activated

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1, allTargetsId[0])).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1, allTargetsId[0])).toBeTruthy()
    
    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken2, allTargetsId[0])).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken2, allTargetsId[0])).toBeFalsy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken3, allTargetsId[0])).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken3, allTargetsId[0])).toBeFalsy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken4, allTargetsId[0])).toBeFalsy() 

    // console.info(alignment.alignmentGroups)
    // console.info(alignment.activeAlignmentGroup)

    // the second tab is activated

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken1, allTargetsId[1])).toBeFalsy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken1, allTargetsId[1])).toBeFalsy()
    
    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken2, allTargetsId[1])).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken2, allTargetsId[1])).toBeTruthy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testOriginToken3, allTargetsId[1])).toBeTruthy()
    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken3, allTargetsId[1])).toBeTruthy()

    expect(cmp.vm.$alignedC.tokenIsGrouped(testTargetToken4, allTargetsId[1])).toBeFalsy() 
    

    //********************************************************************* 
    //let's check hover
    // both tabs are 
    
    // cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken1) // hover the token from the only first group

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()
    
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken3)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken3)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testTargetToken4)).toBeFalsy()

    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken2) // hover the token from the only second group

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()
    
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken3)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken3)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testTargetToken4)).toBeFalsy() 

    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken2) // hover the token from the both groups

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()
    
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken3)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken3)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testTargetToken4)).toBeFalsy() 

    //********************************************************************* 
    // the first tab is activated
    
    // cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken1, allTargetsId[0]) // hover the token from the only first group

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()
    
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken3)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken3)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testTargetToken4)).toBeFalsy()


    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken2, allTargetsId[0]) // hover the token from the both groups, shows only one group

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeTruthy()
    
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken3)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken3)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testTargetToken4)).toBeFalsy()

    //********************************************************************* 
    // the second tab is activated

    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken1, allTargetsId[1]) // hover the token from the only first group - no hovered group

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()
    
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken3)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken3)).toBeFalsy()

    expect(cmp.vm.$alignedC.selectedToken(testTargetToken4)).toBeFalsy()

    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testTargetToken2, allTargetsId[1]) // hover the token from the only second group

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()
    
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken3)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken3)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testTargetToken4)).toBeFalsy() 

    cmp.vm.$alignedC.clearHoverOnAlignmentGroups()
    cmp.vm.$alignedC.activateHoverOnAlignmentGroups(testOriginToken2, allTargetsId[1]) // hover the token from the both groups, but show only one

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken1)).toBeFalsy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken1)).toBeFalsy()
    
    expect(cmp.vm.$alignedC.selectedToken(testOriginToken2)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken2)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testOriginToken3)).toBeTruthy()
    expect(cmp.vm.$alignedC.selectedToken(testTargetToken3)).toBeTruthy()

    expect(cmp.vm.$alignedC.selectedToken(testTargetToken4)).toBeFalsy() 
  })

})
