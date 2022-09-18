<template>
  <modal-base modalName = "save"  :draggable="true" height="auto" @before-open="beforeOpen">
    <div class = "alpheios-alignment-editor-modal-save" data-alpheios-ignore="all"
    >
        <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click="closeModal">
              <x-close-icon />
          </span>
          <h2 class="alpheios-alignment-editor-modal-header">Save locally</h2>
        </div>
        <div class="alpheios-modal-body" >
            <p class="alpheios-main-menu-download-block-radio-block">
              <span v-for="dType in downloadTypes" :key="dType.name" 
                    class="alpheios-main-menu-download-block-radio-block_item" >
                  <input type="radio" :id="downloadTypeId(dType.name)" :value="dType.name" 
                       v-model="state.currentDownloadType" >
                  <tooltip :tooltipText = "dType.tooltip" tooltipDirection = "right">
                    <label :for="downloadTypeId(dType.name)">{{ dType.label }}</label>
                  </tooltip>
              </span>
            </p>
            <p class="alpheios-alignment-editor-file-name-value">
              <input
                  class="alpheios-alignment-input alpheios-file-name-date-value"
                  type="text"
                  v-model="state.fileNameDate"
                  id="fileNameDateId"
                  :disabled = "true"
              >
              <input
                  class="alpheios-alignment-input alpheios-file-name-title-value"
                  type="text"
                  v-model="state.fileNameTitle"
                  id="fileNameTitleId"
                  @keyup.enter = "downloadData"
              >
            </p>
        </div>
        <div class="alpheios-modal-footer" >
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" 
                  @click="downloadData">Save</button>
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" 
                  @click="closeModal">Close</button>
        </div>
    </div>
  </modal-base>
</template>
<script setup>
import XCloseIcon from '@/inline-icons/xclose.svg'
import DownloadIcon from '@/inline-icons/download.svg'

import DownloadController from '@/lib/controllers/download-controller.js'
import Tooltip from '@/vue/common/tooltip.vue'

import SettingsController from '@/lib/controllers/settings-controller.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import { reactive, ref, inject, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()
const $modal = inject('$modal')

const l10n = computed(() => { return L10nSingleton })
const emit = defineEmits([ 'closeModal', 'toggleWaiting' ])

const $textC = inject('$textC')
const $alignedGC = inject('$alignedGC')

const state = reactive({
  currentDownloadType: null,
  fileNameDate: null,
  fileNameTitle: '',
  fileName: ''
})

const closeModal = () => {
  $modal.hide('save')
}

onMounted(() => {
  state.currentDownloadType = downloadTypes.value.length > 0 ? downloadTypes.value[0].name : null
})

const downloadTypes = computed(() => {
  return Boolean($store.state.alignmentUpdated) && 
          Object.values(DownloadController.downloadMethods)
          .filter(method => 
              method.allTexts && (!method.alignmentStarted || $alignedGC.alignmentGroupsWorkflowAvailable) 
              && (!method.hasGroups || $alignedGC.hasAlignmentGroups))
})

const titleName = computed(() => {
  return $store.state.alignmentUpdated && $textC.alignmentTitle
})

const beforeOpen = () => {
  const now = NotificationSingleton.timeNow.bind(new Date())()
  state.fileNameDate = now
  
  state.fileNameTitle = titleName.value  
}

const downloadTypeId = (dTypeName) => {
  return `alpheios-save-popup-download-block__radio_${dTypeName}`
}

const downloadData = async () => {
  $textC.updateAlignmentTitle(state.fileNameTitle)

  state.fileName = `${ state.fileNameDate }-${ state.fileNameTitle }`

  closeModal()
  
  $modal.show('waiting')
  let additional = {}
  if (state.currentDownloadType === 'htmlDownloadAll') {
    additional = {
      theme: SettingsController.themeOptionValue
    }
  }

  try {
    const result = await $textC.downloadData(state.currentDownloadType, additional, state.fileName)
  } catch (err) {
    console.error(err)
  }
  $modal.hide('waiting')
  return true
}

</script>
<style lang="scss">
  .alpheios-alignment-editor-modal-save {
    .alpheios-modal-body {
      padding: 20px 10px;
      overflow: initial;
    }

    .alpheios-modal-footer {
      .alpheios-actions-menu-button {
        margin-right: 15px;
      }
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