<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part12">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">ANNOTATING</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>When this option is enabled (on by default), <b>SHIFT-clicking</b> on any word will open 
            a box to permit an annotation that you can currently characterize as morphology, lemmaid 
            or simply comment, and letting you set the maximum number of characters it will accept.
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
export default {
  name: 'HelpAlignPart12',
  components: {
  },
  data () {
    return {
      partVisible: false
    }
  }
}
</script>
<style lang="scss">
</style>