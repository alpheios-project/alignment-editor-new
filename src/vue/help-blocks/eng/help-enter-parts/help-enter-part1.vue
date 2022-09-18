<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-enter-content-part1">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">BEGINNING A NEW ALIGNMENT</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>Clicking on the <b>BEGIN NEW ALIGNMENT</b> button prompts you to choose a short name for your alignment project.</p>
          <p class="alpheios-editor-help-content-text__image"><img :src="createAlTitlePopupPNG" /></p>
          <p>Responding to this request will open the <b>ENTER TEXT</b> screen.</p>
          <p>Alpheios expects you to enter text in the original language in the empty box on the left and a translation in the box to the right.</p>
          <p>You can add any number of translations by clicking on the
            <span class="alpheios-alignment-editor-add-translation" >
               <plus-icon />
            </span>
            sign and entering one in each successive entry box.</p>
          <p>You can either type or cut and paste text into an entry box or upload a file from your computer.  Both plain text and text with XML markup such as TEI can be entered.</p>
          <p>The only acceptable file extensions are .txt and .xml. A file with no extension will be assumed to be plain text.</p>
          <p>Alpheios will stop with an error message if one attempts to upload a file with any other extension.</p>
          <p class="alpheios-editor-help-content-text__image alpheios-editor-help-content-text__image__wide"><img :src="fileUploadErrorPNG" /></p>

          <div class="alpheios-editor-help-content-special">
              <h5>Special Case: The DTS API</h5>
              <p>One small online corpus - <a href="https://betamasaheft.eu/apidoc.html">Beta maṣāḥǝft API</a>
               can be accessed with a special API illustrating the DTS specification for interacting with online text corpora. 
               <a href="https://distributed-text-services.github.io/specifications/">https://distributed-text-services.github.io/specifications/</a></p>
              <p>This API must be enabled in the Academic Options. See Academic Options below.</p>
          </div>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import createAlTitlePopupPNG from '@/_images/create-al-title-popup.png'
import fileUploadErrorPNG from '@/_images/file-upload-error.png'

import PlusIcon from '@/inline-icons/plus.svg'

export default {
  name: 'HelpEnterPart1',
  components: {
    plusIcon: PlusIcon   
  },
  data () {
    return {
      partVisible: false,

      createAlTitlePopupPNG: createAlTitlePopupPNG,
      fileUploadErrorPNG: fileUploadErrorPNG
    }
  }
}
</script>
<style lang="scss">
</style>