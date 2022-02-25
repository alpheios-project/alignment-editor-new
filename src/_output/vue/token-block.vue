<template>
    <span class = "alpheios-token" :class="tokenClasses"
          :id = "elementId" :ref = "elementId"
          @mouseenter = "addHoverToken"
          @mouseleave = "removeHoverToken"
          @click = "checkAnnotations"
    >
        <span class = "alpheios-token-inner"> {{ token.beforeWord }}{{ token.word }}{{ token.afterWord }} </span>
        <span class = "alpheios-token-translation" 
              v-for = "(groupDataItem, groupDataIndex) in filteredGroupData" :key = "groupDataIndex"
              :lang = groupDataItem.targetLang
              v-html = "translationWord(groupDataItem)"
        >
        </span>
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
    interlinearly: {
      type: Boolean,
      required: false,
      default: false
    },
    shownTabs: {
      type: Array,
      required: false,
      default: () => { return [] }
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
    },
    filteredGroupData () {
      if (this.token.word === 'בירושלם׃') {
        console.info('this.shownTabs - ', this.shownTabs)
        console.info('filteredGroupData - ', this.token.groupDataTrans)
      }
      return this.interlinearly && this.grouped && this.shownTabs && this.token.groupDataTrans ? this.token.groupDataTrans.filter(groupDataItem => this.shownTabs.includes(groupDataItem.targetId) ) : null
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
        this.$emit('addHoverToken', this.token)
      }
    },
    removeHoverToken () {
      if (!this.interlinearly) {
        this.$emit('removeHoverToken', this.token)
      }
    },
    translationWord (groupDataItem) {
      return groupDataItem.word ? groupDataItem.word : '&nbsp;'
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
          display: inline-block;
          vertical-align: top;

          .alpheios-token-inner {
            border: 1px solid transparent;
            display: inline-block;
            text-align: left;
          }

          &.alpheios-token-annotated .alpheios-token-inner {
            border-bottom: 1px solid;
          }

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