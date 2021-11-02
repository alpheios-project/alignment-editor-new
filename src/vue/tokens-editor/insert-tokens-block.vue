<template>
  <modal classes="alpheios-alignment-editor-modal-insert-tokens" name="insert-tokens" :draggable="true" height="auto">
    <div class="alpheios-modal-header" v-if="token">
        <span class="alpheios-alignment-modal-close-icon" @click = "$emit('closeModal')">
            <x-close-icon />
        </span>
        <h3 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('INSERT_TOKENS_BLOCK_HEADER', { word: token.word }) }}</h3>
    </div>
    <div class="alpheios-modal-body" v-if="token">
        
    </div>
    <div class="alpheios-modal-footer" v-if="token">
      <p class="alpheios-alignment-annotations-footer__buttons" >
        <button class="alpheios-editor-button-tertiary alpheios-annotation-save-button" 
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
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    }
  },
  methods: {
    insertTokens () {
      this.$emit('closeModal')
    },
    closeModal () {
      this.$emit('closeModal')
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
  }
</style>
