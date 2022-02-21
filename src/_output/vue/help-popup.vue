<template>
    <modal :classes="classes" name="help-block" :draggable="true" height="auto">
        <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click="$emit('closeModal')">
              <x-close-icon />
          </span>
          <h2 class="alpheios-alignment-editor-modal-header">Help</h2>
        </div>
        <div class="alpheios-modal-body" >
          <div class="alpheios-editor-help-content">
            <p>Mouse over words in the orignal to see what words in the translation have been aligned with them. 
               You have several display options: two column, three column, interlinear, just the aligned words, all the different words 
               in a single translation that the translator used as equivalent to the same ones in the original, 
               and the sentences in which alignments occurred. You cannot edit this document. Make changes in the json version.
            </p>
          </div>
        </div>
    </modal>
</template>
<script>
import XCloseIcon from '@/inline-icons/x-close.svg'

export default {
  name: 'HelpPopup',
  components: {
    xCloseIcon: XCloseIcon
  },
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
    classes () {
      return `alpheios-alignment-editor-modal-help alpheios-alignment-editor-modal-${this.mname}`
    }
  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-help {
  
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