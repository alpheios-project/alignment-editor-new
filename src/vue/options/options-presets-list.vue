<template>
  <modal classes="alpheios-alignment-editor-modal-options alpheios-alignment-editor-modal-options-presets" 
         name="options-presets" :draggable="true" height="auto">

        <div class="alpheios-modal-header" >
            <span class="alpheios-alignment-modal-close-icon" @click="clickCloseIcon">
                <x-close-icon />
            </span>
            <h2 class="alpheios-alignment-editor-modal-header">{{ optionsTitle }}</h2>
        </div>

        <div class="alpheios-modal-body" >
          <div class="alpheios-alignment-editor-modal-options-block">
            <p class = "alpheios-alignment-radio-block alpheios-alignment-option-item__control" v-show="showPresets"> 
                <span v-for="presetVal in presetItem.values" :key="presetVal.value" 
                      :id="itemIdWithValue(presetVal.value)" :class="presetValsClass(presetVal.value)"
                  >
                    <span class="alpheios-preset-item-value-block__text"  @click="changeOption(presetVal.value)">{{ presetVal.text }}</span>
                    <span class="alpheios-preset-item-value-block__icons" @click="showPresetDetailsModal(presetVal)">
                        <span class="alpheios-alignment-icon"><show-icon /></span>
                    </span>
                </span>
            </p>

            <options-preset-details v-show="showOptions" :readOnly = "readOnlyPresetDetails"/>
          </div>


        </div>

        <div class="alpheios-alignment-options__aboutcont">
            <h3>{{ l10n.getMsgS('OPTIONS_BLOCK_INFO_ABOUT') }}</h3>
            <div class="alpheios-alignment-options__versiontext">
            {{ $store.getters.libVersionData }}
            </div>
        </div>
  </modal>
</template>
<script>
import SettingsController from '@/lib/controllers/settings-controller.js'
import XCloseIcon from '@/inline-icons/x-close.svg'
import ShowIcon from '@/inline-icons/show.svg'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import OptionsPresetDetails from '@/vue/options/options-preset-details.vue'

export default {
  name: 'OptionsPresets',
  components: {
    xCloseIcon: XCloseIcon,
    showIcon: ShowIcon,
    optionsPresetDetails: OptionsPresetDetails
  },
  props: {
  },
  data () {
    return {
      selectedPreset: null,
      shownPreset: null,
      showOptions: false,
      showPresets: true,
      readOnlyPresetDetails: true
    }
  },
  mounted () {
    this.selectedPreset = this.presetItem.currentValue
  },
  watch: {
    '$store.state.optionsUpdated' () {
      this.selectedPreset = this.presetItem.currentValue
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    optionsTitle () {
      let res = this.l10n.getMsgS('OPTIONS_TITLE')
      if (this.showOptions) {
        res = `${res} (${this.shownPreset.text})`
      }
      return res
    },
    presetItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.inner.items.preset
    }
  },
  methods: {
    itemIdWithValue (value) {
      return `alpheios-preset_${value}`
    },
    changeOption (value) {
      this.selectedPreset = value
      this.presetItem.setValue(this.selectedPreset)
      
      SettingsController.changeOption(this.presetItem)
    },
    presetValsClass (value) {
      return {
        'alpheios-preset-item-value-block': true,
        'alpheios-preset-item-value-block-selected': this.selectedPreset === value
      }
    },
    showPresetDetailsModal (preset) {
      this.readOnlyPresetDetails = (preset.value === 'custom') ? false : true
      this.shownPreset = preset

      this.showPresets = false
      this.showOptions = true
      
    },
    showPresetsModal () {
      this.showOptions = false
      this.showPresets = true

      this.shownPreset = null
    },
    clickCloseIcon () {
      if (this.showPresets) {
        this.$emit('closeModal')
      } else {
        this.showPresetsModal()
      }
    }
  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-options {
  .alpheios-modal-container {
    width: 700px;
  }
  .alpheios-modal-body {
    // max-height: 700px;
    margin: 0 0 20px;

    border: 0;
    border-top: 2px solid #ddd;
    padding: 10px 0 0 0;
  }

  .alpheios-alignment-editor-modal-options-block {
      padding: 10px;
      text-align: center;
  }

  .alpheios-preset-item-value-block {
    display: inline-block;
    border: 2px solid #e8e8e8;
    padding: 20px;
    background: #ddd;
    margin:10px;
    cursor: pointer;
    min-width: 110px;

    font-weight: bold;
    border-radius: 10px;

    .alpheios-preset-item-value-block__text {
      display: block;
      text-align: center;
    }

    .alpheios-preset-item-value-block__icons {
      display: block;
      text-align: center;

      .alpheios-alignment-icon {
        display: inline-block;
        width: 25px;
        height: 25px;
        cursor: pointer;

        svg {
          width: 100%;
          height: 100%;
          display: block;
          fill: #000;
        }
      }
    }


    &.alpheios-preset-item-value-block-selected {
      border-color: #588598;
      background: #46788d;
      color: #fff;

      .alpheios-preset-item-value-block__icons .alpheios-alignment-icon {
        svg {
          fill: #fff;
        }
      }
    } 
  }
}
</style>
