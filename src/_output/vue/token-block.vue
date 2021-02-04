<template>
    <span class = "alpheios-token" :class="tokenClasses"
          @mouseover = "$emit('addHoverToken', token)"
          @mouseout = "$emit('removeHoverToken', token)"
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
        'alpheios-token-selected': this.selected
      }
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-align-text-segment {
      span.alpheios-token {
          cursor: pointer;
          padding: 4px;
          border: 1px solid transparent;
          display: inline-block;

          &.alpheios-token-grouped {
            border-color: #BCE5F0;
            background: #BCE5F0;
          }

          &.alpheios-token-selected {
            border-color: #F27431;
            background: #F27431;
            color: #fff;
          }
      }
  }
</style>