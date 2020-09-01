import AlignmentGroup from '@/lib/data/alignment-group'

describe('alignment-group.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  beforeAll(() => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })
    appC.defineL10Support()
  })
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 AlignmentGroup - constructor inits origin, target, steps arrays, creates unique id and adds first token', () => {
    const token = new Token({
        textType: 'origin', idWord: 'L1-10', word: 'male'})

    const alGroup = new AlignmentGroup(token)

    expect(alGroup.id).toBeDefined()
    expect(alGroup.origin.length).toEqual(1)
  })
})
