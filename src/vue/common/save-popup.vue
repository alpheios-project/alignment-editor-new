<template>
    <modal :classes="classes" :name="mname" :draggable="true" height="auto" @before-open="beforeOpen" data-alpheios-ignore="all">
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
                  <tooltip :tooltipText = "dType.tooltip" tooltipDirection = "right">
                    <label :for="downloadTypeId(dType.name)">{{ dType.label }}</label>
                  </tooltip>
              </span>
            </p>
            <p class="alpheios-alignment-editor-file-name-value">
              <input
                  class="alpheios-alignment-input alpheios-file-name-date-value"
                  type="text"
                  v-model="fileNameDate"
                  id="fileNameDateId"
                  :disabled = "true"
              >
              <input
                  class="alpheios-alignment-input alpheios-file-name-title-value"
                  type="text"
                  v-model="fileNameTitle"
                  id="fileNameTitleId"
                  @keyup.enter = "downloadData"
              >
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
import NotificationSingleton from '@/lib/notifications/notification-singleton'

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
      currentDownloadType: null,
      fileNameDate: null,
      fileNameTitle: null,
      fileName: null
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
    },
    titleName () {
      return this.$store.state.alignmentUpdated && this.$textC.alignmentTitle
    }
  },
  methods: {
    beforeOpen (event) {
      const now = NotificationSingleton.timeNow.bind(new Date())()
      this.fileNameDate = now
      
      this.fileNameTitle = this.titleName     
    },
    downloadTypeId (dTypeName) {
      return `alpheios-save-popup-download-block__radio_${dTypeName}`
    },
    async downloadData () {

      this.$textC.updateAlignmentTitle(this.fileNameTitle)

      this.fileName = `${ this.fileNameDate }-${ this.fileNameTitle }`

      this.$emit('closeModal')

      this.$modal.show('waiting')
      let additional = {}
      if (this.currentDownloadType === 'htmlDownloadAll') {
        additional = {
          theme: SettingsController.themeOptionValue
        }
      }
      await this.$textC.downloadData(this.currentDownloadType, additional, this.fileName)
      this.$modal.hide('waiting')
      return true
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-modal-save-enter,
  .alpheios-alignment-editor-modal-save-align
  .alpheios-alignment-editor-modal-save-edit {
    .alpheios-modal-body {
      padding: 20px 10px;
      overflow: initial;
    }
  }

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

  .alpheios-alignment-editor-file-name-value {
    .alpheios-alignment-input.alpheios-file-name-date-value {
      display: inline-block;
      width: 100px;
    }

    .alpheios-alignment-input.alpheios-file-name-title-value {
      display: inline-block;
      width: calc(100% - 110px);
    }
  }
</style>