<template>
  <div class="alpheios-alignment-separate-page" id="alpheios-quick-start" >
      <div class="alpheios-alignment-editor__intro" style="background-image: url('images/books.svg')">
        <div class="alpheios-header-logo">
          <router-link to="/">
            <img src="images/alpheios-logo-black-2.png" class="alpheios-logo">
          </router-link>
        </div>

        <h2 class="alpheios-alignment-editor-initial-screen__heading">Alignment Editor</h2>
        <h2 class="alpheios-heading-animated alpheios-alignment-editor-initial-screen__heading-animated">
            <span>Q</span><span>u</span><span>i</span><span>c</span><span>k</span> &nbsp; 
            <span>S</span><span>t</span><span>a</span><span>r</span><span>t</span>
        </h2>
      </div>
  </div>
</template>
<script>

export default {
  name: 'QuickStart',
  components: {
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style lang="scss">
.alpheios-alignment-separate-page {
  .alpheios-alignment-editor__intro {
    background-repeat: repeat-y;
    background-position: 98% 20%;
    background-size: 20% auto;
    // overflow: hidden;
    min-height: 100vh;
    background-color: #f1f9fc;
  }
  .alpheios-header-logo {
      height: auto;
      padding-top: 20px;
      text-align: center;
  }
}
</style>
