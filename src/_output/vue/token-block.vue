<template>
    <span class = "alpheios-token" :class="tokenClasses"
          :id = "elementId" :ref = "elementId"
          @mouseenter = "addHoverToken"
          @mouseleave = "removeHoverToken"
          @click = "checkAnnotations"
    >
        <span class = "alpheios-token-inner"> {{ token.beforeWord }}{{ token.word }}{{ token.afterWord }} </span>
        <span class = "alpheios-token-translation" v-if="interlinearly && grouped">{{ token.word }}</span>
    </span>
</template>
<script>
import GroupUtility from '@/_output/utility/group-utility.js'

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
    interlinearly: {
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
    },
    addHoverToken () {
      if (!this.interlinearly) {
        this.$emit('addHoverToken', token)
      }
    },
    removeHoverToken () {
      if (!this.interlinearly) {
        this.$emit('removeHoverToken', token)
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

          .alpheios-token-inner ,
          .alpheios-token-translation {
            display: block;
            text-align: left;
          }

          .alpheios-token-translation {
            color: #9a9a9a;
            font-size: 95%;
          }
      }
  }
</style>