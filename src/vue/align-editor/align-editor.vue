<template>
  <div class="alpheios-alignment-editor-container">
      <h2>Define Alignment for Source and Translation Texts
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleDefineAlignShow">{{ defineAlignShowLabel }}</span>)
      </h2>
      <div class="alpheios-alignment-editor-align-define-container" v-show="defineAlignShow">
          Alignment Container
      </div>
  </div>
</template>
<script>
export default {
  name: 'AlignEditor',
  components: {},
  props: {
    sourceText: {
      type: Object,
      required: true
    },
    translationText: {
      type: Object,
      required: true
    },
    showEditor: {
      type: Boolean,
      required: false
    }
  },
  data () {
    return {
      defineAlignShow: false
    }
  },
  watch: {
    showEditor () {
      this.defineAlignShow = true
    }
  },
  computed: {
    defineAlignShowLabel () {
      return this.defineAlignShow ? 'hide' : 'show'
    }
  },
  methods: {
    toggleDefineAlignShow () {
      this.defineAlignShow = !this.defineAlignShow
    }
  }
}
</script>
<style lang="scss">

</style>