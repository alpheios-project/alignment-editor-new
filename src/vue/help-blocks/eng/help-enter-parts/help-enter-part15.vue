<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-enter-content-part11">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">CHANGING THE TOKENIZER SERVICE</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>The default is a remote service that is one of the few requiring online connectivity.  
             If you wish to evade this requirement you can use the Offline tokenizer, which is less sophisticated but may suffice 
             if your texts are not too exotic.  If you know that all your texts are in English, you may get the best performance 
             with the language specific English tokenizer.
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>

export default {
  name: 'HelpEnterPart15',
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