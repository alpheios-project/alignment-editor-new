<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-enter-content-part11">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">TURNING OFF THE LANGUAGE ICON</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>The language icon is turned on by default because the tokenizer that prepares the texts for alignment works best 
            when it knows the language of the texts being submitted. But if you always use the same language, which the application 
            always recognizes successfully, you might wish to turn off the display of this icon. It won't affect any functionality.
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>

export default {
  name: 'HelpEnterPart14',
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