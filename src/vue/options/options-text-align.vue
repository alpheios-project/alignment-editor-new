<template>
  <modal classes="alpheios-alignment-editor-modal-options alpheios-alignment-editor-modal-options-align" 
         name="options-align" :draggable="true" height="auto">
    <div class="alpheios-modal-header" >
        <span class="alpheios-alignment-modal-close-icon" @click="$emit('closeModal')">
            <x-close-icon />
        </span>
        <h2 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('OPTIONS_TITLE_TEXT_ALIGN') }}</h2>
    </div>
    <div class="alpheios-modal-body" >
      <div class="alpheios-alignment-editor-modal-options-block">
        <option-item-block :optionItem = "enableAnnotationsOptionItem" :optionInfo="getOptionInfo('enableAnnotations')" />        

        <fieldset v-show = "enableAnnotationsValue" class="alpheios-alignment-editor-modal-options-block-fieldset">
          <option-item-block :optionItem = "availableAnnotationTypesOptionItem"  :disabled = "disableAnnotationsTypes" />
          <option-item-block :optionItem = "maxCharactersAnnotationTextOptionItem" />
        </fieldset>

        <option-item-block :optionItem = "enableTokensEditorOptionItem" :optionInfo="getOptionInfo('enableTokensEditor')"/>
        <select-edit-icons v-show="enableTokensEditorValue" :showLabelTextAsCheckboxLabel = "true"/>

        <option-item-block :optionItem = "enableAlpheiosReadingToolsOptionItem" :optionInfo="getOptionInfo('enableAlpheiosReadingTools')" />
      </div>
    </div>
    <div class="alpheios-modal-footer" >
      <div class="alpheios-alignment-options__aboutcont">
        <h3>{{ l10n.getMsgS('OPTIONS_BLOCK_INFO_ABOUT') }}</h3>
        <div class="alpheios-alignment-options__versiontext">
          {{ versionData }}
        </div>
      </div>
    </div>
  </modal>
</template>
<script>
import XCloseIcon from '@/inline-icons/x-close.svg'
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import SelectEditIcons from '@/vue/options/select-edit-icons.vue'

import SettingsController from '@/lib/controllers/settings-controller'

export default {
  name: 'OptionsTextAlign',
  components: {
    optionItemBlock: OptionItemBlock,
    xCloseIcon: XCloseIcon,
    selectEditIcons: SelectEditIcons
  },
  props: {
  },
  data () {
    return {
      optionsInfo: {
        enableAlpheiosReadingTools: 'OPTIONS_READING_TOOLS_INFO'
      }
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    versionData () {
      return `${this.$store.state.libName} ${this.$store.state.libVersion} (${this.$store.state.libBuildNameForDisplay})`
    },
    enableAlpheiosReadingToolsOptionItem  () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableAlpheiosReadingTools
    },
    enableAnnotationsValue () {
      return this.$store.state.optionsUpdated && SettingsController.enableAnnotations
    },
    availableAnnotationTypesOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.availableAnnotationTypes
    },
    disableAnnotationsTypes () {
      return this.$store.state.updateAnnotations && this.$store.state.docSourceUpdated && this.$textC.hasAnnotations
    },
    
    maxCharactersAnnotationTextOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersAnnotationText
    },

    enableTokensEditorOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableTokensEditor
    },
    enableAnnotationsOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableAnnotations
    },
    enableTokensEditorValue () {
      return this.$store.state.optionsUpdated && SettingsController.enableTokensEditor
    }
  },
  methods: {
    async resetOptions () {
      await SettingsController.resetAllOptions()
    },
    getOptionInfo (itemName) {
      return this.optionsInfo[itemName]
    }
  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-options.alpheios-alignment-editor-modal-options-align {
  .alpheios-modal-container {
    width: 700px;
  }
  .alpheios-modal-body {
    // max-height: 700px;
    // border: 0;
    margin: 0 0 20px;
    padding-top: 20px;
  }

  .alpheios-alignment-editor-modal-options-block {
      padding: 10px;
  }
  .alpheios-alignment-editor-modal-header {
    margin-bottom: 10px;
  }


}
</style>