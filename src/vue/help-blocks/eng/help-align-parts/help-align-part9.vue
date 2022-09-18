<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part9">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">RESUMING</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>Once saved, resuming work on the alignment requires returning to the initial Alpheios Alignment Editor screen 
            and choosing <b>"Resume Previous Alignment"</b>.</p>
          <p class="alpheios-editor-help-content-text__image"><img :src="resumeOnInitialPNG" /></p>
          <ul>
            <li><b>"Autosaved"</b> will display the most recent version of all your alignment projects- one for each.  Restoring from here guarantees the most up to date version.
            </li>
            <li><b>"Ones you saved"</b> gives you the option of restoring from some previous version of the alignment that you wished to save for some special purpose,
             such as documenting intermediate stages of the alignment, possibly in some special location. Restoring in either way returns a JSON file 
             that can be modified and augmented.
            </li>
          </ul>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import resumeOnInitialPNG from '@/_images/resume-on-initial.png'

export default {
  name: 'HelpAlignPart9',
  components: {
  },
  data () {
    return {
      partVisible: false,

      resumeOnInitialPNG: resumeOnInitialPNG
    }
  }
}
</script>
<style lang="scss">
</style>