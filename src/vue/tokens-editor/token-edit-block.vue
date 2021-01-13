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
          >
        </span>
      {{ token.afterWord }}
    </span>
  </tooltip>
</template>
<script>
import Vue from '@vue-runtime'
import Tooltip from '@/vue/common/tooltip.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import TokensEditController from '@/lib/controllers/tokens-edit-controller.js'

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
    mergeTokenLeftIdWord : {
      type: String,
      required: false,
      default: null
    },
    mergeTokenRightIdWord : {
      type: String,
      required: false,
      default: null
    },
    splitTokenIdWord : {
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
    mergeTokenLeftIdWord () {
      if (this.activated && (this.mergeTokenLeftIdWord === this.token.idWord)) {
        this.mergeToken(TokensEditController.direction.LEFT)
      }
    },
    mergeTokenRightIdWord () {
      if (this.activated && (this.mergeTokenRightIdWord === this.token.idWord)) {
        this.mergeToken(TokensEditController.direction.RIGHT)
      }
    },
    splitTokenIdWord () {
      if (this.activated && (this.splitTokenIdWord === this.token.idWord)) {
        this.splitToken()
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
      return this.$store.state.optionsUpdated && this.$settingsC.allowUpdateTokenWordOptionValue
    }
  },
  methods: {
    updateTokenWord () {
      if (this.allowedUpdateTokenWord && (this.token.word !== this.tokenWord)) {
        this.$tokensEC.updateTokenWord(this.token, this.tokenWord)
      }
    },
    mergeToken (direction) {
      this.$tokensEC.mergeToken(this.token, direction)
      this.hideActionsMenu()
    },
    splitToken ()  {
      this.$tokensEC.splitToken(this.token, this.tokenWord)
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
    vertical-align: baseline;
    padding: 8px;
    visibility: hidden;
  }
 
  .alpheios-alignment-editor-token-edit-input-container {
    display: inline-block;
    position: relative;
    padding: 4px;
  }

  .alpheios-alignment-editor-token-edit-input {
    position: absolute;
    width: 100%;
    left: 0;
    z-index: 10;
  }

  .alpheios-alignment-editor-token-edit-span__activated {
    margin-top: 30px;
  }

  .alpheios-alignment-editor-token-edit-not-editable 
  .alpheios-alignment-editor-token-edit__input-width-machine {
    visibility: initial;
  }



</style>