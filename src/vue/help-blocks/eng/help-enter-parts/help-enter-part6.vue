<template>
  <div class="alpheios-editor-help-content">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">THE 
        <span class="alpheios-alignment-editor-add-translation" >
            <plus-icon />
        </span>
         and DONE BUTTONS</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>After you have entered at least one translation and clicked outside its box to indicate 
            that you have finished entering text in that box, two new buttons will appear:
            <span class="alpheios-alignment-editor-add-translation" >
                <plus-icon />
            </span>
            and <b>[DONE]</b>.
          </p>
          <p class="alpheios-editor-help-content-text__image"><img :src="plusDoneButtonPNG" /></p>
          <p>The 
            <span class="alpheios-alignment-editor-add-translation" >
                <plus-icon />
            </span>
          button opens a new text box for a new translation.
          </p>
          <p>The <b>[DONE]</b> button tells the application that you have finished entering translations and wish to "tokenize" all the texts, 
          which will prepare them for alignment. To activate this button you must click somewhere outside a text box to indicate that you have 
          finished entering translations.
          </p>
          <div class="alpheios-editor-help-content-special">
            <p>Most fatal errors occur when the tokenizer finds markup it didn't expect or fails to find markup that it did, 
              so if you have any texts in XML you might wish to turn on the academic option that shows you what language 
              and type of text the application believes it is processing just after you press [DONE] 
              but before anything is sent to the tokenizer. This is irrelevant if you are not using markup and so is off by default.
            </p>
          </div>

          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import plusDoneButtonPNG from '@/_images/plus-done-button.png'

import PlusIcon from '@/inline-icons/plus.svg'

export default {
  name: 'HelpEnterPart6',
  components: {
    plusIcon: PlusIcon   
  },
  data () {
    return {
      partVisible: false,

      plusDoneButtonPNG: plusDoneButtonPNG
    }
  }
}
</script>
<style lang="scss">
</style>