<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part3">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">THE ALIGNMENT WINDOW</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>In order to achieve comparable performance with texts of different sizes, only a specific maximum number of characters 
            is available for alignment any one moment. The default value is 1000 characters 
            (actually the maximum number of complete sentences under that threshold), 
            but this value can be changed in the Options tab of the Enter Text screen to better accommodate different screen sizes.
          </p>
          <p>If your text is larger than the size of this window, the next part can be loaded with the "next" button at the bottom of the current display, 
            while the previous part can be recalled with the "previous" button that will appear at the top of the new screen.
          </p>
          <p class="alpheios-editor-help-content-text__image"><img :src="prevNextAlignPNG" /></p>
          <p>The presence of multiple parts will be shown as small horizontal tiles at the top of the alignment screen, one for each part.</p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import prevNextAlignPNG from '@/_images/prev-next-align.png'

import PlusIcon from '@/inline-icons/plus.svg'

export default {
  name: 'HelpAlignPart3',
  components: {
    plusIcon: PlusIcon   
  },
  data () {
    return {
      partVisible: false,

      prevNextAlignPNG: prevNextAlignPNG
    }
  }
}
</script>
<style lang="scss">
</style>