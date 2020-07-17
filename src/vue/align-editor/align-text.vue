<template>
    <div class  ="alpheios-alignment-editor-align-text"
         :class = "alignTextClass" 
         :dir = "direction" :lang = "lang" 
    >
    <p v-for = "(textLine, indexLine) in formattedText" :key="indexLine">
        <span v-for = "(textWord, indexWord) in textLine" :key="indexWord"
        :data-type = "textType" :id="textWord.idWord"
        @click = "clickWord(textWord)"
        >{{ textWord.word }}{{ textWord.afterWord }}</span>
    </p>
    </div>
</template>
<script>
import FormatText from '@/lib/format-text.js'

export default {
  name: 'AlignText',
  components: {},
  props: {
    alignTextData: {
      type: Object,
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
      console.info('this.alignTextData - ', this.alignTextData)
      return `alpheios-alignment-editor-align__${this.textType}`
    },
    formattedText () {
      return FormatText.defineIdentification(this.alignTextData.text, this.prefixId, this.textType)
    }
  },
  methods: {
    clickWord (textWord) {
      this.$emit('clickWord', textWord)
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-align-text {
        float: left;
        width: 50%;
    }

    .alpheios-alignment-editor-align__source {
        border-right: 2px solid #ddd;
        padding-right: 20px;
    }

    .alpheios-alignment-editor-align__translation {
        padding-left: 20px;
    }

    .alpheios-alignment-editor-align-text {
        p {
            margin: 0;
            line-height: 1.2;
        }
        span {
            cursor: pointer;
            padding: 4px;
            border: 1px solid transparent;
            display: inline-block;

            &:hover {
                border-color: #FFC24F;
                background: #FFD27D;
            }
        }
    }
</style>
