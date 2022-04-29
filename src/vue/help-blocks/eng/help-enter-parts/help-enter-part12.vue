<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-content-part11">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">Show TEXT/XML icon</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>This optional icon gives the user the opportunity to see whether or not the application has detected markup in the text. 
            If it has, the icon will say XML, and if it has not, it will say TEXT. If it appears to be wrong, you can click on the icon and switch the designation.
          </p>
          <p>You can also increase the functionality of that icon by selecting the TEXT/XML "modification" option.  
            When this is enabled, the XML version of the icon will also show the markup expected - by default the most standard TEI elements, 
            with the ability to change these to match your input needs.
          </p>
          <p>The TEXT version of the icon, on the other hand, will give you the option to require both original text and the specific translation 
            to have exactly the same number of sentences or paragraphs, and refuse to accept any mismatches.
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>

export default {
  name: 'HelpEnterPart12',
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