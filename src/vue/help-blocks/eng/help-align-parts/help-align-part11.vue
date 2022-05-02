<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part11">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">OPTIONS FOR ALIGN TEXT</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>Three options that can be set from this screen may be of considerable importance for some users but of no interest to others, 
            so they have been made optional here.
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
export default {
  name: 'HelpAlignPart11',
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