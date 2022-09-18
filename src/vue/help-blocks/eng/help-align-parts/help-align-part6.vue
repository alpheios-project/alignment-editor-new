<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part6">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">ANNOTATING</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>If you wish to add a brief annotation to a word, you can do this with <b>SHIFT-Click</b>.</p>
          <p>An ANNOTATING option allows you to change the size of this window.</p>
          <p class="alpheios-editor-help-content-text__image"><img :src="annotatingOptionPNG" /></p>
        
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import annotatingOptionPNG from '@/_images/annotating-option.png'

export default {
  name: 'HelpAlignPart6',
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