<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-enter-content-part10">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">OPTIONS FOR ENTER TEXT</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>There are two groups: <b>Academic</b> and <b>Advanced</b>.
          </p>

          <p>The Academic are of relevance primarily to those using some form of XML or XML-like TEI markup, 
            or who need to ensure that the number of lines or paragraphs is the same in their original text and their translations.
          </p>
          
          <p>The Advanced settings include those we suggest leaving as they are unless you have very specific requirements that necessitate changing them.
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>

export default {
  name: 'HelpEnterPart10',
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