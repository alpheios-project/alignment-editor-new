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
      this.$emit('addHoverWord', this.textWord)
    },
    removeHoverWord () {
      this.$emit('removeHoverWord', this.textWord)
    }
  }
}
</script>