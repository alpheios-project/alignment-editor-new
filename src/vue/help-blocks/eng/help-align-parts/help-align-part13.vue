<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part13">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">EDITING</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>Enabling this option provides access to the Token Editor, which is the only way you can change text after it has been tokenized 
            and prepared for alignment. When enabled, it appears as a third option at the top of the screen after Enter Text and Align Text. 
            Editing tokenized text is quite a bit more complicated than editing plain text. (See the Help page on the Token Editor screen) 
            For example, only unaligned words can be edited here. So if a word is already aligned, you must unlink it on the ALIGN TEXT screen before 
            its corresponding token can be edited in the TOKEN EDITOR.
          </p>
          <p>When you click on a word in this editor a set of small icons will open above it that perform different functions. 
            If you find that you do not need them all you can disable the superfluous ones to simplify the display.
          </p>
          <p class="alpheios-editor-help-content-text__image"><img :src="tokensEditorPNG" /></p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import tokensEditorPNG from '@/_images/tokens-editor.png'

export default {
  name: 'HelpAlignPart13',
  components: {
  },
  data () {
    return {
      partVisible: false,

      tokensEditorPNG: tokensEditorPNG
    }
  }
}
</script>
<style lang="scss">
</style>