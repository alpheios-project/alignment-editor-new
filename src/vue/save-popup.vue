<template>
    <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-save">
        <template v-slot:header >
          <h2 class="alpheios-alignment-editor-modal-help-header">Save locally</h2>
        </template>
        <template v-slot:body >
            <p class="alpheios-main-menu-download-block-radio-block">
              <span v-for="dType in downloadTypes" :key="dType.name" class="alpheios-main-menu-download-block-radio-block_item" >
                  <input type="radio" :id="downloadTypeId(dType.name)" :value="dType.name" v-model="currentDownloadType" >
                  <tooltip :tooltipText = "dType.tooltip" tooltipDirection = "top-right">
                    <label :for="downloadTypeId(dType.name)">{{ dType.label }}</label>
                  </tooltip>
              </span>
            </p>
        </template>
        <template v-slot:footer>
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="downloadData">Save</button>
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="$emit('closeModal')">Close</button>
        </template>
    </modal>
</template>
<script>
import DownloadIcon from '@/inline-icons/download.svg'

import Modal from '@/vue/common/modal.vue'
import DownloadController from '@/lib/controllers/download-controller.js'
import Tooltip from '@/vue/common/tooltip.vue'

export default {
  name: 'SavePopup',
  components: {
    modal: Modal,
    tooltip: Tooltip,
    downloadIcon: DownloadIcon,
  },
  props: {
    showModal: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      currentDownloadType: null
    }
  },
  watch: {
    showModal () {
      if (this.showModal && this.downloadTypes.length === 1) {
        this.downloadData()
      }
    }
  },
  mounted () {  
    this.currentDownloadType = this.downloadTypes.length > 0 ? this.downloadTypes[0].name : null
  },
  computed: {
    downloadTypes () {
      return Boolean(this.$store.state.alignmentUpdated) && 
             Object.values(DownloadController.downloadMethods).filter(method => method.allTexts && (!method.alignmentStarted || this.$alignedGC.alignmentGroupsWorkflowAvailable))
    }
  },
  methods: {
    downloadTypeId (dTypeName) {
      return `alpheios-save-popup-download-block__radio_${dTypeName}`
    },
    downloadData () {
      this.$emit('closeModal')
      let additional = {}
      if (this.currentDownloadType === 'htmlDownloadAll') {
        additional = {
          theme: this.$settingsC.themeOptionValue
        }
      }
      this.$textC.downloadData(this.currentDownloadType, additional)
      
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
</style>