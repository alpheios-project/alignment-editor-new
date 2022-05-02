<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part7">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">ALPHEIOS READING TOOLS</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>When you are connected to the internet, and especially when you are working with texts in Latin and Greek, 
            you may find it useful to send a word to the alpheios reading tools for morphological analysis and definitions.
             (Some resources are also available for Chinese, Arabic, Persian and Ge'ez) </p>
          <p>You can do this with <b>CTRL-Click</b> on a Windows machine and <b>CMD-Click</b> on a MAC</p>
          <p>Note that in the Options you can turn on and off the Reading Tools's floating toolbar 
            that provides access to the same resources without having to select a word.
          </p>
        
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import annotatingOptionPNG from '@/_images/annotating-option.png'

export default {
  name: 'HelpAlignPart7',
  components: {
  },
  data () {
    return {
      partVisible: false,

      annotatingOptionPNG: annotatingOptionPNG
    }
  }
}
</script>
<style lang="scss">
</style>