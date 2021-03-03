<template>
    <div class="alpheios-alignment-editor-token-edit-empty-input-container" >
        <p class="alpheios-alignment-editor-token-edit-empty-input-description" v-show="showDescription" dir="ltr">
          {{ descriptionText }}
        </p>
        <input
            class = "alpheios-alignment-input alpheios-alignment-editor-token-edit-empty-input"
            type = "text"
            v-model = "tokensText"
            :id = "itemId"
            @keydown.enter = "insertTokens"
        >
    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
export default {
  name: 'EmptyTokensInput',
  components: {
  },
  props: {
    textType: {
      type: String,
      required: true
    },
    textId: {
      type: String,
      required: false
    },
    inputType: {
      type: String,
      required: true
    },
    showDescription: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data () {
    return {
      tokensText: null
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    /**
     * Used for css id definition
     */
    formattedTextId () {
      return this.textId ?? 'no-id'
    },
    itemId () {
      return `alpheios-alignment-editor-token-edit-empty-input__${this.textType}_${this.formattedTextId}_${this.inputType.replace(' ', '_')}`
    },
    descriptionText () {
      return this.inputType === 'start' ? this.l10n.getMsgS('TOKENS_EDIT_INSERT_DESCRIPTION_START') :this.l10n.getMsgS('TOKENS_EDIT_INSERT_DESCRIPTION_END')
    }
  },
  methods: {
    insertTokens () {
      const result = this.$tokensEC.insertTokens(this.tokensText, this.textType, this.textId, this.inputType)
      if (result) {
        this.tokensText = null
      }
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-token-edit-empty-input-container {
    padding: 5px 15px;
  }

  .alpheios-alignment-editor-token-edit-empty-input::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: red;
    opacity: 1; /* Firefox */
  }

  .alpheios-alignment-editor-token-edit-empty-input-description {
    color: #909294;
    padding: 5px 10px 0;
    margin: 0;
  }
</style>