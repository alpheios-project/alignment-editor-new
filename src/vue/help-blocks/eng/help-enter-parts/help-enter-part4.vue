<template>
  <div class="alpheios-editor-help-content">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">TEXT/XML ICON</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>This icon will only display if you have enabled it in Academic Options. It tells you whether or not the application has detected 
            XML markup in that text entry box and lets you switch the choice if it is wrong.</p>

          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>

export default {
  name: 'HelpEnterPart4',
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