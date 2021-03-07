/* eslint-env jest */
/* eslint-disable no-unused-vars */

import TestData from '@tests/_output/utility/test-data.json'
import GroupUtility from '@/_output/utility/group-utility.js'

describe('group-utility.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  const fullData = 
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
    expect(GroupUtility.allTargetTextsIds(fullData)).toEqual(['9a0ca81c-816f-4040-9b4f-c7bde4e19925', '5f40214e-ce53-4d7b-91c3-e8d857b466b8'])
  })

  it('2 GroupUtility - isShownTab checks if targetId is in shownTabs', async () => {
    expect(GroupUtility.isShownTab(['testTargetId1'], 'testTargetId2')).toBeFalsy()
    expect(GroupUtility.isShownTab(['testTargetId1'], 'testTargetId1')).toBeTruthy()
  })

  it('3 GroupUtility - allOriginSegments extracts all segments from origin', async () => {
    const fullData = TestData
    const allOriginSegments = GroupUtility.allOriginSegments(fullData)

    expect(allOriginSegments.length).toEqual(3)
    expect(allOriginSegments[0].origin.tokens.length).toEqual(7)
  })
})
