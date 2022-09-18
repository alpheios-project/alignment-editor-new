<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-enter-content-part10">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">OPTIONS FOR ENTER TEXT</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>There are two groups: <b>Academic</b> and <b>Advanced</b>.
          </p>

          <p>The Academic are of relevance primarily to those using some form of XML or XML-like TEI markup, 
            or who need to ensure that the number of lines or paragraphs is the same in their original text and their translations.
          </p>
          
          <p>The Advanced settings include those we suggest leaving as they are unless you have very specific requirements that necessitate changing them.
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="state.partVisible = false">Close</p>
      </div>
  </div>
</template>
<script setup>
import { reactive } from 'vue'

const state = reactive({
  partVisible: false
})
</script>

<style lang="scss">
</style>