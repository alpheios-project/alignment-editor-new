<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-enter-content-part11">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">INDEXEDDB SUPPORT</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>By default this service is enabled to permit the use of larger text files. It should not be turned off unless some specific problem arises. 
            If you do turn it off for any reason, you will be prompted to select a maximum size of your text input to protect performance. 
            When indexedDB is on, you are only given the opportunity to choose the size of the alignment window. 
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>

export default {
  name: 'HelpEnterPart16',
  components: {
  },
  data () {
    return {
      partVisible: false
    }
  }
}
</script>
<style lang="scss">
</style>