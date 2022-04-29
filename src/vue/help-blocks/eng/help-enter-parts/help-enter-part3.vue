<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-content-part3">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">LANGUAGE ICON</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>Alpheios will attempt to detect the language of the text in each entry box as soon as you leave it 
             and will post its choice as a three-letter icon at the top right of each box. 
             This icon can also be used to change the language if you find that it is incorrect.</p>

          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import nextPrevAlWindow from '@/_images/next-prev-al-window.png'

export default {
  name: 'HelpEnterPart3',
  components: {
    nextPrevAlWindow: nextPrevAlWindow   
  },
  data () {
    return {
      partVisible: false,

      nextPrevAlWindow: nextPrevAlWindow
    }
  }
}
</script>
<style lang="scss">
</style>