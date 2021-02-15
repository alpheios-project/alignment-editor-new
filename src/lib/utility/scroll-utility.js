export default class ScrollUtility {
  static makeScrollTo (idElementBlock, idContainerBlock) {
    const itemEl = document.getElementById(idElementBlock)
    const containerEl = document.getElementById(idContainerBlock)

    if (!itemEl || !containerEl) { return }

    const pPos = containerEl.getBoundingClientRect()
    const cPos = itemEl.getBoundingClientRect()

    if (!this.isElementInViewport(cPos, pPos)) {
      const toTop = cPos.top - pPos.top + containerEl.scrollTop - 10
      this.scrollTo(containerEl, toTop, 1)
    }
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

  static isElementInViewport (elPos, parentPos) {
    const tolerance = 0.01

    const visiblePixelX = Math.min(elPos.right, parentPos.right) - Math.max(elPos.left, parentPos.left)
    const visiblePixelY = Math.min(elPos.bottom, parentPos.bottom) - Math.max(elPos.top, parentPos.top)
    const visiblePercentageX = visiblePixelX / elPos.width * 100
    const visiblePercentageY = visiblePixelY / elPos.height * 100
    return (visiblePercentageX + tolerance > 100) && (visiblePercentageY + tolerance > 100)
  }
}
