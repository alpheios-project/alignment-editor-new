<template>
    <span :data-type = "textType" :id = "textWord.idWord"
          @click.stop = "clickWord"
          @mouseover = "addHoverWord"
          @mouseout = "removeHoverWord"
          class = "alpheios-token"
          :class="tokenClasses"
    >
        {{ textWord.beforeWord }}{{ textWord.word }}{{ textWord.afterWord }}
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
<style lang="scss">
    .alpheios-alignment-editor-align-text {
        span {
            cursor: pointer;
            padding: 4px;
            border: 1px solid transparent;
            display: inline-block;

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