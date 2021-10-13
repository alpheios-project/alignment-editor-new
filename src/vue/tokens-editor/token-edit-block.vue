<template>
    <span class="alpheios-alignment-editor-token-edit alpheios-alignment-editor-token-edit-span" :class="additionalClasses">
      {{ token.beforeWord }}

      <tooltip :tooltipText="l10n.getMsgS('TOKENS_EDIT_IS_NOT_EDITABLE_TOOLTIP')" tooltipDirection="top" v-if="!isEditableToken">
        <span class="alpheios-alignment-editor-token-edit-input-container">
          <span class="alpheios-alignment-editor-token-edit__input-width-machine" aria-hidden="true">{{ tokenWord }}</span>
        </span>
      </tooltip>

        <span class="alpheios-alignment-editor-token-edit-input-container" v-if="isEditableToken">
          <span class="alpheios-alignment-editor-token-edit__input-width-machine" aria-hidden="true">{{ tokenWord }}</span>
          <input
              class = "alpheios-alignment-input alpheios-alignment-editor-token-edit-input"
              type = "text"
              v-model = "tokenWord"
              :id = "itemId"
              @focus = "showActionsMenu"
              :disabled = "!isEditableToken"
              @keydown="checkKeyPres"
              :ref = "itemId"
              :class="tokenClasses"
              autocomplete="off"
          >
        </span>
      {{ token.afterWord }}
    </span>
</template>
<script>
import Vue from '@vue-runtime'
import Tooltip from '@/vue/common/tooltip.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import HistoryStep from '@/lib/data/history/history-step.js'
import SettingsController from '@/lib/controllers/settings-controller'

export default {
  name: 'TokenEditBlock',
  components: {
    tooltip: Tooltip
  },
  props: {
    token: {
      type: Object,
      required: true
    },
    deactivated : {
      type: Number,
      required: false,
      default: 0
    },
    updateTokenIdWord : {
      type: String,
      required: false,
      default: null
    },
    mergeTokenPrevIdWord : {
      type: String,
      required: false,
      default: null
    },
    mergeTokenNextIdWord : {
      type: String,
      required: false,
      default: null
    },
    splitTokenIdWord : {
      type: String,
      required: false,
      default: null
    },
    addLineBreakIdWord : {
      type: String,
      required: false,
      default: null
    },
    removeLineBreakIdWord : {
      type: String,
      required: false,
      default: null
    }
  },
  data () {
    return {
      tokenWord: null,
      activated: false,
      allowedKeyCodes: [32, 37, 39]
    }
  },
  watch: {
    '$store.state.tokenUpdated' () {
      this.tokenWord = this.token.word
    },
    deactivated () {
      this.activated = false
    },

    updateTokenIdWord () {
      if (this.activated && (this.updateTokenIdWord === this.token.idWord)) {
        this.updateTokenWord()
      }
    },
    mergeTokenPrevIdWord () {
      if (this.activated && (this.mergeTokenPrevIdWord === this.token.idWord)) {
        this.mergeToken(HistoryStep.directions.PREV)
      }
    },
    mergeTokenNextIdWord () {
      if (this.activated && (this.mergeTokenNextIdWord === this.token.idWord)) {
        this.mergeToken(HistoryStep.directions.NEXT)
      }
    },
    splitTokenIdWord () {
      if (this.activated && (this.splitTokenIdWord === this.token.idWord)) {
        this.splitToken()
      }
    },
    addLineBreakIdWord () {
      if (this.activated && (this.addLineBreakIdWord === this.token.idWord)) {
        this.addLineBreakAfterToken()
      }
    },
    removeLineBreakIdWord () {
      if (this.activated && (this.removeLineBreakIdWord === this.token.idWord)) {
        this.removeLineBreakAfterToken()
      }
    }
  },
  mounted () {
    this.tokenWord = this.token.word
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    itemId () {
      return this.$store.state.tokenUpdated && `${this.token.idWord}-input-id`
    },
    additionalClasses () {
      return {
        'alpheios-alignment-editor-token-edit-span__activated' : this.activated,
        'alpheios-alignment-editor-token-edit-not-editable': !this.isEditableToken
      }
    },
    isEditableToken () {
      return this.$store.state.alignmentUpdated && this.$tokensEC.isEditableToken(this.token)
    }, 
    allowedUpdateTokenWord () {
      return this.$store.state.optionsUpdated && SettingsController.allowUpdateTokenWordOptionValue
    },
    tokenClasses () {
      return { 
        'alpheios-token-annotated': this.hasAnnotations
      }
    },
    hasAnnotations () {
      return this.$store.state.updateAnnotations && this.$textC.getAnnotations(this.token).length > 0
    }
  },
  methods: {
    updateTokenWord () {
      if (this.allowedUpdateTokenWord && (this.token.word !== this.tokenWord)) {
        this.$tokensEC.updateTokenWord(this.token, this.tokenWord)
        this.hideActionsMenu()
      }
    },
    mergeToken (direction) {
      this.$tokensEC.mergeToken(this.token, direction)
      this.hideActionsMenu()
    },
    splitToken ()  {
      this.$tokensEC.splitToken(this.token, this.tokenWord)
      this.hideActionsMenu()
    },
    addLineBreakAfterToken () {
      this.$tokensEC.addLineBreakAfterToken(this.token)
      this.hideActionsMenu()
    },
    removeLineBreakAfterToken () {
      this.$tokensEC.removeLineBreakAfterToken(this.token)
      this.hideActionsMenu()
    },
    hideActionsMenu () {
      this.activated = false
      this.$emit('hideActionsMenu')
    },
    async showActionsMenu () {
      this.$emit('removeAllActivated')

      await Vue.nextTick()

      this.activated = true
      this.$emit('showActionsMenu', {
        token: this.token,
        leftPos: this.$el.offsetLeft,
        topPos: this.$el.offsetTop
      })
    },
    
    checkKeyPres (event) {
      if (!this.allowedUpdateTokenWord && this.allowedKeyCodes.indexOf(event.keyCode) === -1) {
        event.preventDefault()
      }
    }
  } 
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-token-edit-span {
    display: inline-block;
    vertical-align: baseline;
    padding: 4px;
    position: relative;
  }

  .alpheios-alignment-editor-token-edit__input-width-machine {
    display: inline-block;
    vertical-align: top;
    padding: 8px;
    visibility: hidden;
  }
 
  .alpheios-alignment-editor-token-edit-input-container {
    display: inline-block;
    vertical-align: baseline;
    position: relative;
    padding: 4px;
  }

  input.alpheios-alignment-editor-token-edit-input {
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 10;

    &.alpheios-token-annotated {
      border-width: 2px;
      border-color: #ae0000;
    }
  }

  .alpheios-alignment-editor-token-edit-span__activated {
    margin-top: 30px;
  }

  .alpheios-alignment-editor-token-edit-not-editable 
  .alpheios-alignment-editor-token-edit__input-width-machine {
    visibility: initial;
  }



</style>