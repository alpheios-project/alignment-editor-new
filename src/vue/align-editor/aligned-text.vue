<template>
    <div class  ="alpheios-alignment-editor-align-text"
         :class = "alignTextClass" 
         :dir = "direction" :lang = "lang" 
         @click = "clickEmptyText"
    >
      <template v-for = "textWord in formattedText">
        <token
          v-if ="textWord.word"
          :text-type = "textType" :text-word = "textWord"
          @clickWord = "clickWord"
          @addHoverWord = "addHoverWord"
          @removeHoverWord = "removeHoverWord"
          :selected = "updated && showAlignment.includes(textWord.idWord)"
        />
        <br v-if="textWord.hasLineBreak" />
      </template>
    </div>
</template>
<script>
import FormatText from '@/lib/format-text.js'
import Token from '@/vue/align-editor/token.vue'

export default {
  name: 'AlignedText',
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
      // console.info('this.alignTextData - ', this.alignTextData)
      return `alpheios-alignment-editor-align__${this.textType}`
    },
    formattedText () {
      return FormatText.defineIdentification(this.alignTextData.text, this.prefixId, this.textType)
    }
  },
  methods: {
    clickWord (textWord) {
      this.$emit('clickWord', textWord)
    },
    addHoverWord (textWord) {
      // console.info('hoverWord - textWord', textWord)
      this.$emit('addHoverWord', textWord)
      this.updated = this.updated + 1
    },
    removeHoverWord (textWord) {
      // console.info('hoverWord - textWord', textWord)
      this.$emit('removeHoverWord', textWord)
      this.updated = this.updated + 1
    },
    clickEmptyText () {
      // console.info('clickEmptyText', this.textType)
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
