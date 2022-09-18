export default class DocumentUtility {
  static setPageClassToBody (currentPage) {
    const currentPageClass = `alpheios-${currentPage}-page`
    const pageClasses = ['initial', 'options', 'text-editor', 'align-editor', 'tokens-editor', 'quick-start', 'video-tutorials', 'whats-new']
    pageClasses.forEach(pageClass => {
      document.body.classList.remove(`alpheios-${pageClass}-page`)
    })

    document.body.classList.add(`${currentPageClass}`)
  }
}
