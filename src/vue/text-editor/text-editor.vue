<template>
  <div class="alpheios-alignment-editor-container">
      <h2>{{ l10n.getMsgS('TEXT_EDITOR_HEADING') }} 
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
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'TextEditor',
  components: {
    textEditorSingleBlock: TextEditorSingleBlock
  },
  props: {  
    originUpdated: {
      type: Number,
      required: true
    },
    targetUpdated: {
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
  created () {
    this.$textC.createAlignment()
  },
  computed: {
    defineTextsShowLabel () {
      return this.defineTextsShow ? this.l10n.getMsgS('TEXT_EDITOR_HIDE') : this.l10n.getMsgS('TEXT_EDITOR_SHOW')
    },
    updatedOrigin () {
      return this.originUpdated && this.originText ?  this.originText : null
    },
    updatedTarget () {
      return this.targetUpdated && this.targetText ?  this.targetText : null
    },
    originText () {
      return this.originUpdated ? this.$textC.originDocSource : {}
    },
    targetText () {
      return this.targetUpdated ? this.$textC.targetDocSource : {}
    },
    l10n () {
      return L10nSingleton
    }
  },
  methods: {
    toggleDefineTextsShow () {
      this.defineTextsShow = !this.defineTextsShow
    },
    updateOriginText (text) {
      this.$textC.updateOriginDocSource(text)
    },
    updateTargetText (text) {
      this.$textC.updateTargetDocSource(text)
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