export default class ScrollUtility {
  static makeScrollTo (idElementBlock, idContainerBlock) {
    // const tokenEl = document.getElementById(`token-${idWord}`)
    const itemEl = document.getElementById(idElementBlock)
    // const segId = this.cssId(textType, hoveredGroup.targetId, hoveredGroup.segIndex)
    const containerEl = document.getElementById(idContainerBlock)

    const pPos = containerEl.getBoundingClientRect()
    const cPos = itemEl.getBoundingClientRect()

    const toTop = cPos.top - pPos.top + containerEl.scrollTop - 10
    this.scrollTo(containerEl, toTop, 1)
  }

  static easeInOutQuad (t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  static scrollTo (element, to, duration) {
    const start = element.scrollTop
    const change = to - start
    const startTime = performance.now()
    let now, elapsed, t

    const animateScroll = () => {
      now = performance.now()
      elapsed = (now - startTime) / 1000
      t = (elapsed / duration)

      element.scrollTop = start + change * this.easeInOutQuad(t)

      if (t < 1) window.requestAnimationFrame(animateScroll)
    }
    animateScroll()
  }
}
