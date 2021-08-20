<template>
    <modal :classes="classes" :name="mname" :draggable="true" height="auto" @before-open="beforeOpen">
        <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click="$emit('closeModal')">
              <x-close-icon />
          </span>
          <h2 class="alpheios-alignment-editor-modal-header">Save locally</h2>
        </div>
        <div class="alpheios-modal-body" >
            <p class="alpheios-main-menu-download-block-radio-block">
              <span v-for="dType in downloadTypes" :key="dType.name" class="alpheios-main-menu-download-block-radio-block_item" >
                  <input type="radio" :id="downloadTypeId(dType.name)" :value="dType.name" v-model="currentDownloadType" >
                  <tooltip :tooltipText = "dType.tooltip" tooltipDirection = "top-right">
                    <label :for="downloadTypeId(dType.name)">{{ dType.label }}</label>
                  </tooltip>
              </span>
            </p>
        </div>
        <div class="alpheios-modal-footer" >
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="downloadData">Save</button>
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="$emit('closeModal')">Close</button>
        </div>
    </modal>
</template>
<script>
import XCloseIcon from '@/inline-icons/x-close.svg'
import DownloadIcon from '@/inline-icons/download.svg'

import DownloadController from '@/lib/controllers/download-controller.js'
import Tooltip from '@/vue/common/tooltip.vue'

import SettingsController from '@/lib/controllers/settings-controller.js'

export default {
  name: 'SavePopup',
  components: {
    tooltip: Tooltip,
    downloadIcon: DownloadIcon,
    xCloseIcon: XCloseIcon
  },
  props: {
    mname: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      currentDownloadType: null
    }
  },

  mounted () {  
    this.currentDownloadType = this.downloadTypes.length > 0 ? this.downloadTypes[0].name : null
  },
  computed: {
    downloadTypes () {
      return Boolean(this.$store.state.alignmentUpdated) && 
             Object.values(DownloadController.downloadMethods)
             .filter(method => method.allTexts && (!method.alignmentStarted || this.$alignedGC.alignmentGroupsWorkflowAvailable) && (!method.hasGroups || this.$alignedGC.hasAlignmentGroups))
    },
    classes () {
      return `alpheios-alignment-editor-modal-${this.mname}`
    }
  },
  methods: {
    beforeOpen (event) {
      if (this.downloadTypes.length === 1) {
        this.downloadData()
        event.cancel()
      }
    },
    downloadTypeId (dTypeName) {
      return `alpheios-save-popup-download-block__radio_${dTypeName}`
    },
    async downloadData () {
      this.$emit('closeModal')
      let additional = {}
      if (this.currentDownloadType === 'htmlDownloadAll') {
        additional = {
          theme: SettingsController.themeOptionValue
        }
      }
      await this.$textC.downloadData(this.currentDownloadType, additional)
      
    }
  }
}
</script>
<style lang="scss">
  .alpheios-main-menu-download-block-radio-block_item {
    padding-right: 20px; 
  }

  .alpheios-main-menu-download-block-radio-block {
    vertical-align: middle;

    .alpheios-main-menu-download-block-radio-block_item {
      display: inline-block;
      white-space: nowrap;
    }
  }

  .alpheios-alignment-editor-modal-save .alpheios-modal-body {
      overflow: initial;
  }

  .alpheios-alignment-editor-modal-save {
    .alpheios-alignment-editor-modal-header {
      margin-bottom: 10px;
    }
  }
</style>