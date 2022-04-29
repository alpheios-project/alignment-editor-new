<template>
  <div class="alpheios-editor-help-content">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">SAVING </h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
        <p class="alpheios-editor-help-content-text__image"><img :src="saveLocallyButtonPNG" /></p>
          <p>Until you have actually aligned some text, this button will simply save a JSON copy of whatever texts 
            you have put in the entry boxes in whatever default location your browser uses, and the application 
            will also save its own copy of your texts if indexedDB is enabled, which it is by default.
          </p>
          <p>After you have aligned some text on the Align Text screen this button will give you the choice of either saving your alignment work in <b>JSON</b> 
            (to permit continued work) or in <b>HTML</b> (the final output - permitting multiple display options.) (See Help on the Alignment screen.)
          </p>
          <p>The button is called <b>SAVE LOCALLY</b> to emphasize that unless it is explicitly sent elsewhere the alignment and 
            all relevant data reside only on your local machine.
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import saveLocallyButtonPNG from '@/_images/save-locally-button.png'

export default {
  name: 'HelpEnterPart7',
  components: {
    saveLocallyButtonPNG: saveLocallyButtonPNG   
  },
  data () {
    return {
      partVisible: false,

      saveLocallyButtonPNG: saveLocallyButtonPNG
    }
  }
}
</script>
<style lang="scss">
</style>