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
    },
    annotationMode: {
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
        'alpheios-token-clicked-first': this.firstInActiveGroup,
        'alpheios-token-part-shadowed': (this.token.partNum % 2 === 0),
        'alpheios-token-annotated': this.hasAnnotations,
        'alpheios-token-annotation-mode': this.annotationMode
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
    },
    clickToken () {
      return this.annotationMode ? this.updateAnnotation : this.updateAlignmentGroup
    },
    hasAnnotations () {
      return this.$store.state.updateAnnotations && this.$textC.getAnnotations(this.token).length > 0
    }
  },
  methods: {
    updateAnnotation () {
      this.$emit('update-annotation', this.token)
    },
    updateAlignmentGroup (event) {
      this.$emit('update-alignment-group', this.token)
    },
    addHoverToken () {
      if (!this.annotationMode) {
        this.$emit('add-hover-token', this.token)
      }
    },
    removeHoverToken () {
      if (!this.annotationMode) {
        this.$emit('remove-hover-token', this.token)
      }
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-align-text-segment {
        span.alpheios-token {
            cursor: pointer;
            padding: 2px 2px 0 2px;
            margin-bottom: 2px;
            border: 1px solid transparent;
            display: inline-block;
            vertical-align: top;
            
            &.alpheios-token-part-shadowed {
              font-weight: bold;
            }

            &:hover {
                border-color: #FFC24F;
                background: #FFD27D;
            }
            &.alpheios-token-annotation-mode:hover {
              border-color: initial;
              background: initial;
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

            &.alpheios-token-annotated {
              border-bottom: 1px solid;
            }
        }
    }
</style>