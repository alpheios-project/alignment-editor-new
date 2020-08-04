<template>
  <div class="alpheios-alignment-editor-container">
      <h2>Define Origin and Target Texts 
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleDefineTextsShow">{{ defineTextsShowLabel }}</span>)
      </h2>
      <div class="alpheios-alignment-editor-text-define-container" v-show="defineTextsShow">
        <div class="alpheios-alignment-editor-text-define-container-inner">
          <div class="alpheios-alignment-editor-text-container alpheios-alignment-editor-origin-text-container">
            <text-editor-single-block 
                text-id="origin" 
                @update-text = "updateOriginText" 
                :external-text = "updatedOrigin"
            />
          </div>

          <div class="alpheios-alignment-editor-text-container alpheios-alignment-editor-target-text-container">
            <text-editor-single-block 
                text-id="target" 
                @update-text = "updateTargetText" 
                :external-text = "updatedTarget"    
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
    originText: {
      type: Object,
      required: false
    },
    targetText: {
      type: Object,
      required: false
    },   
    originTextUpdated: {
      type: Number,
      required: true
    },
    targetTextUpdated: {
      type: Number,
      required: true
    },
    hideEditor: {
      type: Number,
      required: false
    }
  },
  data () {
    return {
      defineTextsShow: true,
      updatedOriginText: null,
      updatedTargetText: null
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
    updatedOrigin () {
      return this.originTextUpdated && this.originText ?  this.originText : null
    },
    updatedTarget () {
      return this.targetTextUpdated && this.targetText ?  this.targetText : null
    }
  },
  methods: {
    toggleDefineTextsShow () {
      this.defineTextsShow = !this.defineTextsShow
    },
    updateOriginText (text) {
      this.$emit('update-origin-text', text)
    },
    updateTargetText (text) {
      this.$emit('update-target-text', text)
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

    .alpheios-alignment-editor-origin-text-container {
      padding-right: 10px;
    }

    .alpheios-alignment-editor-target-text-container {
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