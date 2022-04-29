<template>
  <div class="alpheios-editor-help-content">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">LARGE TEXTS</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>As long as indexedDB is enabled (which is the default - see <b>Options</b>) you can enter quite large files, 
             if necessary an entire book, but remember that you are storing everything on your local computer. 
             Large texts are automatically divided into smaller parts for display in an "alignment window" whose size is intended 
             to optimize performance during alignment. Alignment can only be performed on text currently visible 
             in this alignment window (whose size can be adjusted in the Options tab). 
             Successive portions of the text are loaded with the "Next" button at the bottom of the screen, 
             while previous portions can be recalled with the "Previous" button at the top.  
             You may wish to adjust the size of this window to adapt the display to the size of your screen.</p>
          <p class="alpheios-editor-help-content-text__image"><img :src="nextPrevAlWindowPNG" /></p>
          <p>When you finish entering text in one box and move the cursor to the next several things happen:</p>
          <ul>
            <li>The application attempts to identify the language in the text box you have just left, and posts an icon with a three-letter language abbreviation above it on the right.</li>
            <li>If you have enabled the <b>Academic Options</b> it also posts an icon telling you whether it has detected markup such as XML.</li>
            <li>And, most importantly, it activates the <b>[DESCRIBE]</b> button below the box and posts a red icon above it to warn you that as yet no description exists.</li>
          </ul>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import nextPrevAlWindowPNG from '@/_images/next-prev-al-window.png'

export default {
  name: 'HelpEnterPart2',
  components: {
    nextPrevAlWindowPNG: nextPrevAlWindowPNG   
  },
  data () {
    return {
      partVisible: false,

      nextPrevAlWindowPNG: nextPrevAlWindowPNG
    }
  }
}
</script>
<style lang="scss">
</style>