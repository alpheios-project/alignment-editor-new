<template>
    <span class = "alpheios-token" :class="tokenClasses"
          :id = "elementId" :ref = "elementId"
          @mouseenter = "$emit('addHoverToken', token)"
          @mouseleave = "$emit('removeHoverToken', token)"
          @click = "checkAnnotations"
    >
        {{ token.beforeWord }}{{ token.word }}{{ token.afterWord }}
    </span>
</template>
<script>
export default {
  name: 'TokenBlock',
  props: {
    token: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      required: false,
      default: false
    },
    grouped: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    tokenClasses () {
      return { 
        'alpheios-token-grouped': this.grouped,
        'alpheios-token-selected': this.selected,
        'alpheios-token-annotated': this.token.annotated
      }
    },
    elementId () {
      return `token-${this.token.idWord}`
    }
  },
  methods: {
    checkAnnotations () {
      if (this.token.annotated) {
        this.$modal.show('annotations', { token: this.token })
      }
    }
  }
}
</script>
<style lang="scss">
    .alpheios-al-editor-container-inner {
      span.alpheios-token {
          cursor: pointer;
          padding: 2px 2px 0 2px;
          margin-bottom: 2px;
          border: 1px solid transparent;
          display: inline-block;
          vertical-align: top;

          &.alpheios-token-annotated {
            border-bottom: 1px solid;
          }
      }
  }
</style>