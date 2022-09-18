<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part8">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">SAVING</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>Before you have aligned anything, <b>[SAVE LOCALLY]</b> will just save a JSON copy of whatever texts you have entered. 
             After you have actually started an alignment, <b>[SAVE LOCALLY]</b> will give you two choices:</p>
          <p class="alpheios-editor-help-content-text__image"><img :src="savingPNG" /></p>
          <ul>
            <li><b>JSON</b> now saves a copy of all your alignments up to that point in a format from which work can be resumed by reloading 
                into some copy of the alpheios alignment editor.
            </li>
            <li><b>HTML</b> creates the HTML page that is the application's intended output - an HTML file that can display the alignments in multiple ways, 
              but which cannot easily be edited. (See the Help icon on the HTML page for further details on your display options.)
            </li>
          </ul>
          <p>Both types of files will be saved in your browser's default location unless you have enabled choice of location in the browser, 
            and both can of course be shared with anyone, anywhere. Resuming work on the JSON version will however require 
            reloading into some copy of the alpheios alignment editor running on Chrome, Firefox or Safari.
          </p>
          <p>In reality, if indexedDB is enabled (the default), you only need to use the JSON option if you want to keep copies 
            in some special location or document intermediate stages of the alignment, because the application automatically 
            keeps its own copy of the most recent version of your alignment, which can be retrieved from the "autosaved" 
            list under the Resume Alignment button on the application's first screen.
          </p>
          <p class="alpheios-editor-help-content-text__image"><img :src="autosavedRecordsPNG" /></p>
          <p>The automatically saved indexedDB records, one for each alignment project, will accumulate indefinitely in the order in which they were saved, 
            so you may wish to eliminate ones you are sure you will never need. But remember that there will then be no way to correct the corresponding HTML files. 
            It is good practice to save a JSON copy of any HTML page you consider important enough to save in case you subsequently 
            discover something you wish to change in it. And remember that the automatically saved version created by indexedDB is only on your own machine. 
            You will have to use a version you saved yourself to continue work on a different computer.
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import savingPNG from '@/_images/saving.png'
import autosavedRecordsPNG from '@/_images/autosaved-records.png'

export default {
  name: 'HelpAlignPart8',
  components: {
  },
  data () {
    return {
      partVisible: false,

      savingPNG: savingPNG,
      autosavedRecordsPNG: autosavedRecordsPNG
    }
  }
}
</script>
<style lang="scss">
</style>