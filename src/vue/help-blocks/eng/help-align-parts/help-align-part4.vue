<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part4">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">ADDING TEXT DURING ALIGNMENT</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>You can add another translation after you have begun aligning in a different translation without losing the alignments you have already made, 
            but you will have to return to the Enter Text Screen to do so and use the 
            <span class="alpheios-alignment-editor-add-translation" >
               <plus-icon />
            </span>
             sign to open a new box for that new translation. You will then have to use the <b>[DONE]</b> button again to tokenize 
             the new text and return to the alignment screen. The alignments you made previously in the other translation will still be there.
          </p>
          <p class="alpheios-editor-help-content-text__image"><img :src="state.newTranslationTextPNG" /></p>
          <p>You cannot, however, simply add additional text to a translation box whose contents have already been tokenized from the Enter Text Screen. 
            You will have to add additional text in the Token Editor. You might find it easier to use another text box to add more text (such as another chapter) 
            from the same translation.
          </p>
        
          <p class="alpheios-editor-help-content-text__close-link" @click="state.partVisible = false">Close</p>
      </div>
  </div>
</template>
<script setup>
import newTranslationTextPNG from '@/_images/new-translation-text.png'
import PlusIcon from '@/inline-icons/plus.svg'

import { reactive } from 'vue'

const state = reactive({
  partVisible: false,

  newTranslationTextPNG: newTranslationTextPNG
})
</script>
<style lang="scss">
</style>