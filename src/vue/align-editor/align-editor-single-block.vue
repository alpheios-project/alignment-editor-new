<template>
    <div class  ="alpheios-alignment-editor-align-text"
         :class = "alignTextClass" 
         :dir = "direction" :lang = "lang" 
         @click = "clickEmptyText"
    >
      <template v-for = "token in alignTextData.tokens">
        <token
          v-if ="token.word"
          :text-type = "textType" :text-word = "token" :key = "token.idWord"
          @clickWord = "clickWord"
          @addHoverWord = "addHoverWord"
          @removeHoverWord = "removeHoverWord"
          :selected = "updated && showAlignment.includes(token.idWord)"
        />
        <br v-if="token.hasLineBreak" />
      </template>
    </div>
</template>
<script>
import Token from '@/vue/align-editor/token.vue'

export default {
  name: 'AlignEditorSingleBlock',
  components: {
    token: Token
  },
  props: {
    alignTextData: {
      type: Object,
      required: false
    },

    showAlignment: {
      type: Array,
      required: false
    },
    prefixId: {
      type: Number,
      required: true,
      default: '1'
    }
  },
  data () {
    return {
      updated: 1
    }
  },
  computed: {
    textType () {
      return this.alignTextData.textType
    },
    direction () {
      return this.alignTextData.direction
    },
    lang () {
      return this.alignTextData.lang
    },
    alignTextClass () {
      console.info('alignTextData.tokens - ', this.alignTextData.tokens)
      return `alpheios-alignment-editor-align__${this.textType}`
    }
  },
  methods: {
    clickWord (token) {
      this.$emit('clickWord', token)
    },
    addHoverWord (token) {
      this.$emit('addHoverWord', token)
      this.updated = this.updated + 1
    },
    removeHoverWord (token) {
      this.$emit('removeHoverWord', token)
      this.updated = this.updated + 1
    },
    clickEmptyText () {
      this.$emit('clickEmptyText', this.textType)
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-align-text {
        float: left;
        width: 50%;
    }

    .alpheios-alignment-editor-align__origin {
        border-right: 2px solid #ddd;
        padding-right: 20px;
    }

    .alpheios-alignment-editor-align__target {
        padding-left: 20px;
    }

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

            &.alpheios-token-selected {
              border-color: #f59d6e;
              background: #f59d6e;
            }
        }
    }
</style>
