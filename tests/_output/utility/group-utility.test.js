/* eslint-env jest */
/* eslint-disable no-unused-vars */

import TestData from '@tests/_output/utility/test-data.json'
import GroupUtility from '@/_output/utility/group-utility.js'

describe('group-utility.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  beforeAll(async () => {

  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 GroupUtility - allTargetTextsIds extracts all targetIds', async () => {
    const fullData = TestData
    expect(GroupUtility.allTargetTextsIds(fullData)).toEqual(['5f40214e-ce53-4d7b-91c3-e8d857b466b8', '9a0ca81c-816f-4040-9b4f-c7bde4e19925'])
  })

  it('2 GroupUtility - isShownTab checks if targetId is in shownTabs', async () => {
    expect(GroupUtility.isShownTab(['testTargetId1'], 'testTargetId2')).toBeFalsy()
    expect(GroupUtility.isShownTab(['testTargetId1'], 'testTargetId1')).toBeTruthy()
  })

  it('3 GroupUtility - allOriginSegments extracts all segments from origin', async () => {
    const fullData = TestData
    const allOriginSegments = GroupUtility.allOriginSegments(fullData)

    expect(allOriginSegments.length).toEqual(3)
    
    expect(allOriginSegments[0].index).toEqual(0)
    expect(allOriginSegments[0].targets).toEqual([])
    
    expect(allOriginSegments[0].origin).toEqual({ tokens: expect.any(Array) })
    expect(allOriginSegments[0].origin.tokens.length).toEqual(7)

    expect(allOriginSegments[1].index).toEqual(1)
    expect(allOriginSegments[1].targets).toEqual([])

    expect(allOriginSegments[1].origin).toEqual({ tokens: expect.any(Array) })
    expect(allOriginSegments[1].origin.tokens.length).toEqual(6)

    expect(allOriginSegments[2].index).toEqual(2)
    expect(allOriginSegments[2].targets).toEqual([])

    expect(allOriginSegments[2].origin).toEqual({ tokens: expect.any(Array) })
    expect(allOriginSegments[2].origin.tokens.length).toEqual(7)
  })

  
  it('4 GroupUtility - allShownSegments extracts all segments from origin', async () => {
    const fullData = TestData
    // console.info('fullData', fullData)

    const allShownSegments1 = GroupUtility.allShownSegments(fullData, ['9a0ca81c-816f-4040-9b4f-c7bde4e19925'])
    // console.info('allShownSegments1 - ', allShownSegments1)

    expect(allShownSegments1.length).toEqual(3)

    expect(allShownSegments1[0].index).toEqual(0)
    
    expect(allShownSegments1[0].origin).toEqual({ tokens: expect.any(Array) })
    expect(allShownSegments1[0].origin.tokens.length).toEqual(7)

    expect(allShownSegments1[0].targets).toEqual([
      {
        targetId: '9a0ca81c-816f-4040-9b4f-c7bde4e19925',
        segment: {
          tokens: expect.any(Array)
        }
      }
    ])
    expect(allShownSegments1[0].targets[0].segment.tokens.length).toEqual(4)

    const allShownSegments2 = GroupUtility.allShownSegments(fullData, ['9a0ca81c-816f-4040-9b4f-c7bde4e19925', '5f40214e-ce53-4d7b-91c3-e8d857b466b8'])

    expect(allShownSegments2[0].targets).toEqual([
      {
        targetId: '9a0ca81c-816f-4040-9b4f-c7bde4e19925',
        segment: {
          tokens: expect.any(Array)
        }
      },
      {
        targetId: '5f40214e-ce53-4d7b-91c3-e8d857b466b8',
        segment: {
          tokens: expect.any(Array)
        }
      }
    ])
    expect(allShownSegments2[0].targets[0].segment.tokens.length).toEqual(4)
    expect(allShownSegments2[0].targets[1].segment.tokens.length).toEqual(4)
  })

  it('5 GroupUtility - alignmentGroups converts fullData to alignment groups array - full', async () => {
    const fullData = TestData
    // console.info('fullData', fullData)

    const allGroups = GroupUtility.alignmentGroups(fullData)

    // console.info('allGroups - ', allGroups)

    expect(Object.keys(allGroups)).toEqual(['0a0c90fc-8219-4b01-93ad-c9a464f3d18b', 'c2700d5e-f037-4261-a2f4-138a12fffd74'])

    expect(allGroups['0a0c90fc-8219-4b01-93ad-c9a464f3d18b']).toEqual({
      targetId: '9a0ca81c-816f-4040-9b4f-c7bde4e19925',
      segIndex: 1,
      origin: [ '1-1-3', '1-1-4' ],
      target: [ '2-1-2', '2-1-3' ],
      targetSentence: [],
      metadata: '',
      langName: 'Latin'
    })

    expect(allGroups['c2700d5e-f037-4261-a2f4-138a12fffd74']).toEqual({
      targetId: '5f40214e-ce53-4d7b-91c3-e8d857b466b8',
      segIndex: 1,
      origin: [ '1-1-3', '1-1-4' ],
      target: [ '3-1-1', '3-1-2' ],
      targetSentence: [],
      metadata: '',
      langName: 'German'
    })
  })

  it('6 GroupUtility - alignmentGroups converts fullData to alignment groups array - short = equivalence', async () => {
    const fullData = TestData
    // console.info('fullData', fullData)

    const allGroupsShort = GroupUtility.alignmentGroups(fullData, 'short')

    // console.info('allGroups - ', allGroups)

    expect(Object.keys(allGroupsShort)).toEqual(['0a0c90fc-8219-4b01-93ad-c9a464f3d18b', 'c2700d5e-f037-4261-a2f4-138a12fffd74'])

    expect(allGroupsShort['0a0c90fc-8219-4b01-93ad-c9a464f3d18b']).toEqual({
      targetId: '9a0ca81c-816f-4040-9b4f-c7bde4e19925',
      segIndex: 1,
      origin: [ '1-1-3', '1-1-4' ],
      target: [
        {
          groupData: [
               {
                 groupId: '0a0c90fc-8219-4b01-93ad-c9a464f3d18b',
                 targetId: '9a0ca81c-816f-4040-9b4f-c7bde4e19925',
               },
           ],
           grouped: true,
           idWord: '2-1-2',
           sentenceIndex: 1,
           textType: 'target',
           word: 'et',
        },
        {
          groupData: [
               {
                 groupId: '0a0c90fc-8219-4b01-93ad-c9a464f3d18b',
                 targetId: '9a0ca81c-816f-4040-9b4f-c7bde4e19925',
               },
           ],
           grouped: true,
           idWord: '2-1-3',
           sentenceIndex: 1,
           textType: 'target',
           word: 'Pannoniis',
        }
      ],
      targetSentence: [],
      metadata: '',
      langName: 'Latin'
    })

    const allGroupsEquivalence = GroupUtility.alignmentGroups(fullData, 'equivalence')
    expect(allGroupsEquivalence).toEqual(allGroupsShort)
  })

  it('7 GroupUtility - alignmentGroups converts fullData to alignment groups array - sentence = short before collectSentences ', async () => {
    const fullData = TestData
    // console.info('fullData', fullData)

    const allGroupsShort = GroupUtility.alignmentGroups(fullData, 'short')

    jest.spyOn(GroupUtility, 'collectSentences')

    const allGroupsSentence = GroupUtility.alignmentGroups(fullData, 'sentence')
    
    expect(GroupUtility.collectSentences).toHaveBeenCalled()
    expect(Object.keys(allGroupsSentence)).toEqual(['0a0c90fc-8219-4b01-93ad-c9a464f3d18b', 'c2700d5e-f037-4261-a2f4-138a12fffd74'])
    
    const allGroupsShort1 = allGroupsShort['0a0c90fc-8219-4b01-93ad-c9a464f3d18b']

    expect(allGroupsSentence['0a0c90fc-8219-4b01-93ad-c9a464f3d18b']).toEqual({
      targetId: allGroupsShort1.targetId,
      segIndex: allGroupsShort1.segIndex,
      origin: allGroupsShort1.origin,
      target: allGroupsShort1.target,
      targetSentence: expect.any(Array),
      metadata: allGroupsShort1.metadata,
      langName: allGroupsShort1.langName
    })
  })

  it('8 GroupUtility - collectSentences completes targetSentence with an array of tokens of collected sentence ', async () => {
    const fullData = TestData
    const allGroupsSentence = GroupUtility.alignmentGroups(fullData, 'sentence')

    expect(allGroupsSentence['0a0c90fc-8219-4b01-93ad-c9a464f3d18b'].targetSentence).toEqual([
      {
        textType: 'target',
        idWord: '2-1-0',
        word: 'Raetis',
        sentenceIndex: 1,
        grouped: false
      },
      {
        textType: 'target',
        idWord: '2-1-1',
        word: 'que',
        sentenceIndex: 1,
        grouped: false
      },
      {
        textType: 'target',
        idWord: '2-1-2',
        word: 'et',
        sentenceIndex: 1,
        grouped: true,
        groupData: [
          {
            groupId: '0a0c90fc-8219-4b01-93ad-c9a464f3d18b',
            targetId: '9a0ca81c-816f-4040-9b4f-c7bde4e19925',
          },
        ]
      },
      {
        textType: 'target',
        idWord: '2-1-3',
        word: 'Pannoniis',
        sentenceIndex: 1,
        grouped: true,
        groupData: [
          {
            groupId: '0a0c90fc-8219-4b01-93ad-c9a464f3d18b',
            targetId: '9a0ca81c-816f-4040-9b4f-c7bde4e19925',
          },
        ]
      }
    ])
  })

  it('9 GroupUtility - collectPrevTokensInSentence collects tokens before given based on sentence count ', async () => {
    const fullData = TestData
    
    const allGroupsShort = GroupUtility.alignmentGroups(fullData, 'short') // it is the same as sentence before collectSentences

    const segment = fullData.targets['9a0ca81c-816f-4040-9b4f-c7bde4e19925'].segments[1]
    const group = allGroupsShort['0a0c90fc-8219-4b01-93ad-c9a464f3d18b']

    const targetBeforeIndex = GroupUtility.collectPrevTokensInSentence(segment, 2, 1, 0, group.targetSentence)

    expect(group.targetSentence).toEqual([
      {
        textType: 'target',
        idWord: '2-1-0',
        word: 'Raetis',
        sentenceIndex: 1,
        grouped: false
      },
      {
        textType: 'target',
        idWord: '2-1-1',
        word: 'que',
        sentenceIndex: 1,
        grouped: false
      }
    ])
  })

  it('10 GroupUtility - collectNextTokensInSentence collects tokens after given based on sentence count ', async () => {
    const fullData = TestData
    
    const allGroupsShort = GroupUtility.alignmentGroups(fullData, 'short') // it is the same as sentence before collectSentences

    const segment = fullData.targets['9a0ca81c-816f-4040-9b4f-c7bde4e19925'].segments[1]
    const targetSentence = [
      {
        textType: 'target',
        idWord: '2-1-0',
        word: 'Raetis',
        sentenceIndex: 1,
        grouped: false
      },
      {
        textType: 'target',
        idWord: '2-1-1',
        word: 'que',
        sentenceIndex: 1,
        grouped: false
      },
      {
        textType: 'target',
        idWord: '2-1-2',
        word: 'et',
        sentenceIndex: 1,
        grouped: true,
        groupData: expect.any(Object)
      },
      {
        textType: 'target',
        idWord: '2-1-3',
        word: 'Pannoniis',
        sentenceIndex: 1,
        grouped: true,
        groupData: expect.any(Object)
      }
    ]
    const targetAfterIndex = GroupUtility.collectNextTokensInSentence(segment, 3, 1, 0, targetSentence)
    expect(targetAfterIndex.length).toEqual(4) // no tokens after the sentence
  })

  it('11 GroupUtility - tokensEquivalentGroups collects alignment groups in the format for equivalence view', async () => {
    const fullData = TestData
    
    const allGroupsEquivalence = GroupUtility.alignmentGroups(fullData, 'equivalence')
    
    const alltargetIds = GroupUtility.allTargetTextsIds(fullData)

    const tokensEquivalentGroups = GroupUtility.tokensEquivalentGroups(fullData, allGroupsEquivalence, alltargetIds)

    expect(Object.keys(tokensEquivalentGroups)).toEqual(['and', 'Pannonii'])

    expect(tokensEquivalentGroups['and']).toEqual({
      allIds: [ '1-1-3', '1-1-3' ],
      allGroupIds: [
        '0a0c90fc-8219-4b01-93ad-c9a464f3d18b',
        'c2700d5e-f037-4261-a2f4-138a12fffd74'
      ],
      targets: {
        '9a0ca81c-816f-4040-9b4f-c7bde4e19925': {
          langName: 'Latin',
          metadata: '',
          targets: expect.any(Object),
          filteredTargets: expect.any(Object)
        },
        '5f40214e-ce53-4d7b-91c3-e8d857b466b8': {
          langName: 'German',
          metadata: '',
          targets: expect.any(Object),
          filteredTargets: expect.any(Object)
        }
      }
    })
    
    const targetData1 = tokensEquivalentGroups['and'].targets['9a0ca81c-816f-4040-9b4f-c7bde4e19925']

    expect(targetData1).toEqual({
      langName: 'Latin',
      metadata: '',
      targets: [
        [
          {
            textType: 'target',
            idWord: '2-1-2',
            word: 'et',
            sentenceIndex: 1,
            grouped: true,
            groupData: expect.any(Object)
          },
          {
            textType: 'target',
            idWord: '2-1-3',
            word: 'Pannoniis',
            sentenceIndex: 1,
            grouped: true,
            groupData: expect.any(Object)
          }
        ]
      ],
      filteredTargets: {
        'et_Pannoniis': {
          count: 1, target: [
            {
              textType: 'target',
              idWord: '2-1-2',
              word: 'et',
              sentenceIndex: 1,
              grouped: true,
              groupData: expect.any(Object)
            },
            {
              textType: 'target',
              idWord: '2-1-3',
              word: 'Pannoniis',
              sentenceIndex: 1,
              grouped: true,
              groupData: expect.any(Object)
            }
          ]
        }
      }
    })
  })
})
