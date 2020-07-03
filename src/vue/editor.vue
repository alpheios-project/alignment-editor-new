<template>
  <div class="alpheios-alignment-app-container">
    <div class="alpheios-alignment-editor-container">
        <h2>Define Source and Translation Texts 
          (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleDefineTextsShow">{{ defineTextsShowLabel }}</span>)
        </h2>
        <div class="alpheios-alignment-editor-text-define-container" v-show="defineTextsShow">
          <div class="alpheios-alignment-editor-text-define-container-inner">
            <div class="alpheios-alignment-editor-text-container alpheios-alignment-editor-source-text-container">
              <editor-text-block text-id="source"></editor-text-block>
            </div>

            <div class="alpheios-alignment-editor-text-container alpheios-alignment-editor-translation-text-container">
              <editor-text-block text-id="translation"></editor-text-block>
            </div>
          </div>
          <div class="alpheios-alignment-editor-container-footer">
            <button class="alpheios-button-primary">Align</button>
          </div>
        </div>
    </div>
  </div>
</template>
<script>
import EditorTextBlock from '@/vue/editor-text-block.vue'
export default {
  name: 'Editor',
  components: {
    editorTextBlock: EditorTextBlock
  },
  data () {
    return {
      defineTextsShow: true
    }
  },
  computed: {
    defineTextsShowLabel () {
      return this.defineTextsShow ? 'hide' : 'show'
    }
  },
  methods: {
    toggleDefineTextsShow () {
      this.defineTextsShow = !this.defineTextsShow
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-container {
      padding: 15px;

      h2 {
        margin: 0;
        padding: 0;
      }
    }
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