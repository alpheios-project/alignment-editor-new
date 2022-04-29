<template>
  <div class="alpheios-editor-help-content">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">CHANGING YOUR MIND</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>On this Enter Text screen you can make changes to both the original text or a translation in their respective entry boxes, 
            but after you have selected <b>[DONE]</b> and are taken to the Align Text screen, altering texts will be more difficult. 
            If you only need to make minor changes, such as correcting the spelling of a word, or adding or deleting line breaks, 
            you can do so from the Token Editor screen. (See Help page for the Token Editor) But major changes are done more conveniently here. 
            Try to review your input text before saying <b>[DONE]</b>.
          </p>

          <p>The X in the upper right corner of the entry boxes will clear the text and 
            any associated description and prepare the box to receive new text and a new description.
          </p>
          
          <p class="alpheios-editor-help-content-text__image"><img :src="xButtonTextWindowPNG" /></p>

          <p>If you want to end the current alignment session and start over you can choose <b>[Begin New Alignment]</b> 
            from the MENU in the upper left of the screen.
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>

import xButtonTextWindowPNG from '@/_images/x-button-text-window.png'

export default {
  name: 'HelpEnterPart9',
  components: {
    xButtonTextWindowPNG: xButtonTextWindowPNG
  },
  data () {
    return {
      partVisible: false,

      xButtonTextWindowPNG: xButtonTextWindowPNG
    }
  }
}
</script>
<style lang="scss">
</style>