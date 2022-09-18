<template>
  <modal classes="alpheios-alignment-editor-modal-insert-tokens" name="insert-tokens" :draggable="true" height="auto">
    <div class="alpheios-modal-header" v-if="token">
        <span class="alpheios-alignment-modal-close-icon" @click = "$emit('closeModal')">
            <x-close-icon />
        </span>
        <h3 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('INSERT_TOKENS_BLOCK_HEADER', { word: token.word }) }}</h3>
    </div>
    <div class="alpheios-modal-body" v-if="token">
      <div class = "alpheios-alignment-radio-block alpheios-alignment-option-item__control" >
          <span v-for="(dir, dirIndex) in directions" :key="dirIndex">
              <input type="radio" :id="itemIdWithValue(dir.value)" :value="dir.value" v-model="curDirection" >
              <label :for="itemIdWithValue(dir.value)">{{ dir.label }}</label>
          </span>
      </div>
      <textarea id="alpheios-alignment-insert-tokens-textarea" v-model="words" class="alpheios-alignment-editor-text-blocks-textarea">
      ></textarea>
    </div>
    <div class="alpheios-modal-footer" v-if="token">
      <p class="alpheios-alignment-annotations-footer__buttons" >
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button"
            @click="insertTokens" :disabled="false">
            {{ l10n.getMsgS('INSERT_TOKENS_BLOCK_SAVE_BUTTON') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="closeModal">{{ l10n.getMsgS('INSERT_TOKENS_BLOCK_CANCEL_BUTTON') }}</button>
      </p>
    </div>
  </modal>
</template>
<script>
import XCloseIcon from '@/inline-icons/x-close.svg'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import HistoryStep from '@/lib/data/history/history-step.js'

export default {
  name: 'InsertTokensBlock',
  components: {
    xCloseIcon: XCloseIcon
  },
  props: {
    token: {
      type: Object,
      required: false
    }
  },
  data () {
    return {
      curDirection: null,
      words: null
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    directions () {
      this.curDirection = HistoryStep.directions.PREV
      return [ 
              { label: this.l10n.getMsgS('INSERT_TOKENS_DIR_PREV'), value: HistoryStep.directions.PREV },
              { label: this.l10n.getMsgS('INSERT_TOKENS_DIR_NEXT'), value: HistoryStep.directions.NEXT }
            ]
    }
  },
  methods: {
    initData () {
      this.words = null
      this.curDirection = HistoryStep.directions.PREV
    },

    itemIdWithValue (dir) {
      return `alpheios-alignment-radio-direction-${dir}`
    },
    async insertTokens () {
      await this.$tokensEC.insertTokens(this.words, this.token, this.curDirection)
      this.closeModal()
    },
    closeModal () {
      this.$emit('closeModal')
      this.initData()
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-modal-insert-tokens {
    .alpheios-modal-body {
        border: 0;
        padding: 0;
    }

    .alpheios-alignment-radio-block {
      margin-top: 0;
      margin-bottom: 15px;
      span {
        display: inline-block;
        margin-right: 20px;
        vertical-align: middle;
      }
    }

    .alpheios-alignment-editor-text-blocks-textarea {
      padding: 10px 55px 10px 10px;
      width:100%;
      min-height: 100px;
      font-size: inherit;
    }
  }
</style>
