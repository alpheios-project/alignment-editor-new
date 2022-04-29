<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-content-part8">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">RESUMING A PREVIOUS ALIGNMENT</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>The <b>[RESUME PREVIOUS ALIGNMENT]</b> button allows you to continue to modify an alignment that has been saved somewhere on your computer. 
          You can either choose the file from wherever you have saved it in your local file system or from a list of automatically saved versions. 
          The files are named simply by the time of their creation and the short project name originally chosen by the user. 
          (See <b>Saving</b> in the Help page of the Align Text screen.)
          </p>

          <div class="alpheios-editor-help-content-special">
            <h5>Special Case: Ugarit</h5>
            <p>You can also use the Resume button to upload an alignment that has been made in 
                <a href="http://www.ugarit.ialigner.com/index.php">Ugarit</a> and saved as XML. Just choose it the same way you would a JSON file 
                that you have saved yourself. You will then be able to modify or continue it the way you would any other resumed file, 
                as well as export it as HTML file with all the alpheios display options. 
            </p>
          </div>

          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>

export default {
  name: 'HelpEnterPart8',
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