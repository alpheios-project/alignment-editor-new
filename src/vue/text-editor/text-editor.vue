<template>
  <div class="alpheios-alignment-editor-container">
      <h2>Define Source and Translation Texts 
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleDefineTextsShow">{{ defineTextsShowLabel }}</span>)
      </h2>
      <div class="alpheios-alignment-editor-text-define-container" v-show="defineTextsShow">
        <div class="alpheios-alignment-editor-text-define-container-inner">
          <div class="alpheios-alignment-editor-text-container alpheios-alignment-editor-source-text-container">
            <text-editor-single-block 
                text-id="source" 
                @update-text = "updateSourceText" 
                :external-text = "updatedSource"
            />
          </div>

          <div class="alpheios-alignment-editor-text-container alpheios-alignment-editor-translation-text-container">
            <text-editor-single-block 
                text-id="translation" 
                @update-text = "updateTranslationText" 
                :external-text = "updatedTranslation"    
            />
          </div>
        </div>
      </div>
  </div>
</template>
<script>
import TextEditorSingleBlock from '@/vue/text-editor/text-editor-single-block.vue'
export default {
  name: 'TextEditor',
  components: {
    textEditorSingleBlock: TextEditorSingleBlock
  },
  props: {
    updatedData: {
      type: Object,
      required: false
    },
    hideEditor: {
      type: Boolean,
      required: false
    }
  },
  data () {
    return {
      defineTextsShow: true
    }
  },
  watch: {
    hideEditor () {
      this.defineTextsShow = false
    }
  },
  computed: {
    defineTextsShowLabel () {
      return this.defineTextsShow ? 'hide' : 'show'
    },
    updatedSource () {
      return this.updatedData && this.updatedData.source ?  this.updatedData.source : null
    },
    updatedTranslation () {
      return this.updatedData && this.updatedData.translation ?  this.updatedData.translation : null
    }
  },
  methods: {
    toggleDefineTextsShow () {
      this.defineTextsShow = !this.defineTextsShow
    },
    updateSourceText (text) {
      this.$emit('update-source-text', text)
    },
    updateTranslationText (text) {
      this.$emit('update-translation-text', text)
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-text-define-container-inner {
      &:before,
      &:after {
        content: '';
        display: block;
        clear: both;
      }
    }

    .alpheios-alignment-editor-text-define-container {
        .alpheios-alignment-editor-text-container {
          width: 50%;
          float: left;
        }
    }

    .alpheios-alignment-editor-source-text-container {
      padding-right: 10px;
    }

    .alpheios-alignment-editor-translation-text-container {
      padding-left: 10px;
    }

    .alpheios-alignment-editor-container-footer {
      text-align: center;
      border-top: 2px solid #757575;
      padding-top: 15px;
    }

    .alpheios-alignment-editor-text-define-container__show-label {
      cursor: pointer;
      font-size: 90%;
      text-decoration: underline;
      color: #185F6D;
    }
</style>