/**
 * Executes and additional Nemo UI specific initialization after an Embedded object has been activated.
 *
 * @param {object} embedded - An activated instance of the `Embedded` class from the embedded library.
 */
let embedPostActivation = function (embedded) {
  if (embedded.platform.isMobile) {
    let lookupEl = document.querySelector('#alph-lookup-ctrl')
    if (lookupEl) {
      lookupEl.addEventListener('click', function () {
        embedded.openActionPanelLookup()
      }, { passive: true })
    }
    let toolsEl = document.querySelector('#alph-tools-ctrl')
    if (toolsEl) {
      toolsEl.addEventListener('click', function () {
        embedded.openActionPanelToolbar()
      }, { passive: true })
    }
  } else {
    let helpControl = document.querySelector(".alpheios-toolbar__help-control")
    if (helpControl) {
      helpControl.setAttribute('data-toggle','modal')
      helpControl.setAttribute('data-target',"#helpPopup")
    }
  }
}

export { embedPostActivation }