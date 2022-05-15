<template>
  <div class="alpheios-alignment-separate-page" id="alpheios-whats-new" >
      <div class="alpheios-alignment-editor__intro" style="background-image: url('images/books.svg')">
        <div class="alpheios-header-logo">
          <router-link to="/">
            <img src="images/alpheios-logo-black-2.png" class="alpheios-logo">
          </router-link>
        </div>

        <h2 class="alpheios-alignment-editor-initial-screen__heading">Alignment Editor</h2>
        <h2 class="alpheios-heading-animated alpheios-alignment-editor-initial-screen__heading-animated">
            <span>W</span><span>h</span><span>a</span><span>t</span><span>'</span><span>s</span> &nbsp; 
            <span>N</span><span>e</span><span>w</span>
        </h2>
      </div>
  </div>
</template>
<script>
import DocumentUtility from '@/lib/utility/document-utility.js'

export default {
  name: 'WhatsNew',
  components: {
  },
  data () {
    return {
    }
  },
  beforeRouteEnter(to, from, next) {  
    DocumentUtility.setPageClassToBody('whats-new')
    next()
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style lang="scss">
</style>
