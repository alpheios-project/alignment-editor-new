/* eslint-env jest */
/* eslint-disable no-unused-vars */
import Alignment from '@/lib/data/alignment'
import AppController from '@/lib/controllers/app-controller.js'

import AlignmentSource1 from '@tests/corrupted/json/1-08-11_14-51-corrupted-alignment-dbData.json'
import AlignmentSource2 from '@tests/corrupted/json/2-08-11_14-51-corrupted-alignment-dbData.json'

describe('alignment.test.js', () => {
  // console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  beforeAll(async () => {
    const appC = new AppController({
      appId:'alpheios-alignment-editor'
    })
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
    await appC.defineSettingsController()
  })
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })


  it('1 Corrupted Alignment - #588 2021-11-08 - alignment', async () => {
    const sourceJSON1 = AlignmentSource1
    const alignment1 = await Alignment.convertFromIndexedDB(sourceJSON1)

    expect(alignment1).toBeInstanceOf(Alignment)

    const sourceJSON2 = AlignmentSource2
    const alignment2 = await Alignment.convertFromIndexedDB(sourceJSON2)

    expect(alignment2).toBeInstanceOf(Alignment)
  })

})
