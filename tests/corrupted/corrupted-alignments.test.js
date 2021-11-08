/* eslint-env jest */
/* eslint-disable no-unused-vars */
import Alignment from '@/lib/data/alignment'
import AppController from '@/lib/controllers/app-controller.js'
import SourceText from '@/lib/data/source-text'
import AlignedText from '@/lib/data/aligned-text'
import AlignmentGroup from '@/lib/data/alignment-group'
import Segment from '@/lib/data/segment'

import AlignmentSource1 from '@tests/corrupted/json/1-05-11_14-29-corrupted-alignment.json'

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
    const alignment = await Alignment.convertFromIndexedDB(sourceJSON1)

    console.info(alignment)
  })

})
