<template>
    <span :data-type = "token.textType" :id = "elementId"
          @click.exact.prevent = "clickToken"
          @mouseover = "addHoverToken"
          @mouseleave = "removeHoverToken"
          class = "alpheios-token"
          :class="tokenClasses"
    >
        {{ tokenBeforeWord }}{{ tokenWord }}{{ tokenAfterWord }}
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
    },
    inActiveGroup: {
      type: Boolean,
      required: false,
      default: false
    },
    firstInActiveGroup: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
    }
  },
  computed: {
    tokenClasses () {
      return { 
        'alpheios-token-selected': this.selected, 
        'alpheios-token-grouped': this.grouped ,
        'alpheios-token-clicked': this.inActiveGroup,
        'alpheios-token-clicked-first': this.firstInActiveGroup
      }
    }, 
    tokenWord () {
      return this.$store.state.tokenUpdated && this.token.word
    }, 
    tokenBeforeWord () {
      return this.$store.state.tokenUpdated && this.token.beforeWord
    }, 
    tokenAfterWord () {
      return this.$store.state.tokenUpdated && this.token.afterWord
    },
    elementId () {
      return `token-${this.token.idWord}`
    }
  },
  methods: {
    clickToken (event) {
      this.$emit('click-token', this.token)
    },
    addHoverToken () {
      this.$emit('add-hover-token', this.token)
    },
    removeHoverToken () {
      this.$emit('remove-hover-token', this.token)
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
            vertical-align: top;

            &:hover {
                border-color: #FFC24F;
                background: #FFD27D;
            }

            &.alpheios-token-grouped {
              border-color: #BCE5F0;
              background: #BCE5F0;
            }

            &.alpheios-token-selected {
              border-color: #F27431;
              background: #F27431;
              color: #fff;
            }

            &.alpheios-token-clicked {
              border-color: #f59d6e;
              background: #f59d6e;
            }

            &.alpheios-token-clicked-first {
              border-color: #f06d26;
              background: #f06d26;
              color: #fff;
            }
        }
    }
</style>