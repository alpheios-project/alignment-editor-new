<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part2">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">UNDOING</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>The <b>[UNDO]</b> button will break the last link made, and the <b>[REDO]</b> button will reconnect it.</p>
          <p>To undo an alignment link that was established earlier:</p>
          <ul>
            <li>click on a word in one side of the alignment (either original or translation) turning its words green</li>
            <li>go to the other side and click on each of the words in the alignment in turn, unlinking them one by one</li>
            <li>return to the first side and click on each of the green words in turn, returning all the words in the link to their original red color.</li>
          </ul>
          <div class="alpheios-editor-help-content-special">
              <h5>OR (shortcut trick especially useful for very long alignments)</h5>
              <p>You can just click on a word in the phrase to highlight it and then reload the page in the browser. 
                This will take you back to the first screen of the application and you will then have to click on Resume Alignment 
                and the most recently saved JSON version, but when the page returns the complete alignment will be gone.
              </p>
          </div>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import createAlGroupPNG from '@/_images/create-al-group.png'

import PlusIcon from '@/inline-icons/plus.svg'

export default {
  name: 'HelpAlignPart2',
  components: {
    plusIcon: PlusIcon   
  },
  data () {
    return {
      partVisible: false,

      createAlGroupPNG: createAlGroupPNG
    }
  }
}
</script>
<style lang="scss">
</style>