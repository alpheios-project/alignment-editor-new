<template>
    <span :data-type = "textType" :id = "textWord.idWord"
          @click.stop = "clickWord"
          @mouseover = "addHoverWord"
          @mouseout = "removeHoverWord"
          :class="{ 'alpheios-token-selected': selected }"
    >
        {{ textWord.word }}{{ textWord.afterWord }}
    </span>
</template>
<script>
export default {
  name: 'Token',
  props: {
    textType: {
      type: String,
      required: true
    },
    textWord: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods: {
    clickWord () {
      this.$emit('clickWord', this.textWord)
    },
    addHoverWord () {
      // console.info('hoverWord - textWord', textWord)
      this.$emit('addHoverWord', this.textWord)
    },
    removeHoverWord () {
      // console.info('hoverWord - textWord', textWord)
      this.$emit('removeHoverWord', this.textWord)
    }
  }
}
</script>