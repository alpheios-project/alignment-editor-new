<template>
  <modal-base modalName="help-output" :draggable="true" height="auto" :shiftY="0.3" > 
    <div class="alpheios-alignment-editor-modal-help ">
        <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click="$modal.hide('help-output')">
              <x-close-icon />
          </span>
          <h2 class="alpheios-alignment-editor-modal-header">Help</h2>
        </div>
        <div class="alpheios-modal-body" >
          <div class="alpheios-editor-help-content">
            <p>Mouse over words in the original to see what words in the translation have been aligned with them.</p> 
            <p>You have several display options: two column, three column, interlinear, just the aligned words, all the different words 
            in a single translation that the translator used as equivalent to the same ones in the original, 
            and the sentences in which alignments occurred.</p>
            <p>The menu in the upper left of the screen lets you choose which translations to display and their order.</p>
            <p>You cannot edit this document. Make changes in the json version.</p>
          </div>
        </div>
    </div>
  </modal-base>
</template>
<script setup>
import XCloseIcon from '@/inline-icons/xclose.svg'

import { computed, reactive, inject, onMounted, watch } from 'vue'
const $modal = inject('$modal')

</script>
<style lang="scss">
.alpheios-alignment-editor-modal-help {
  .alpheios-alignment-modal-close-icon {
    top: -25px;
    right: -10px;
  }

  .alpheios-modal-container {
    width: 700px;
  }
  .alpheios-modal-body {
    // max-height: 700px;
    border: 0;
    padding: 0 15px 0 0;
    margin: 0 0 20px;
  }
  .alpheios-alignment-editor-modal-header {
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .alpheios-editor-help-content {
    text-indent: 10px;
    text-align: justify;
    

    .alpheios-editor-help-content-error {
        color: #f00;
        font-weight: bold;
    }
  }
}
</style>