<template>
  <div id="alpheios-alignment-editor-app-container" class="alpheios-alignment-editor-app-container">
    <span class="alpheios-alignment-app-menu-open-icon" @click = "state.menuShow++" v-show="!state.showInitialScreenBlock">
      <navbar-icon />
    </span>

    <main-menu 
      @upload-data-from-file = "uploadDataFromFile"
      @clear-all = "clearAll"
      @new-initial-alignment = "newInitialAlignment"
      @upload-data-from-db = "uploadDataFromDB"

      :menuShow = "state.menuShow"
      :updateCurrentPage = "state.updateCurrentPage"
    />

    <notification-bar />

    <initial-screen 
        v-show="state.showInitialScreenBlock"
        @upload-data-from-file = "uploadDataFromFile" @upload-data-from-db = "uploadDataFromDB" 
        @delete-data-from-db = "deleteDataFromDB"
        @new-initial-alignment="newInitialAlignment" @clear-all-alignments="clearAllAlignmentsFromDB" />

    <text-editor v-show="state.showSourceTextEditorBlock" 
        @add-translation="addTarget" @align-text="showSummaryPopup" 
        @showAlignmentGroupsEditor = "showAlignmentGroupsEditor" 
        @showTokensEditor = "showTokensEditor"
      />

    <align-editor v-show="state.showAlignmentGroupsEditorBlock" 
      @showSourceTextEditor = "showSourceTextEditor" 
      @showTokensEditor = "showTokensEditor"
    />

    <tokens-editor v-show="state.showTokensEditorBlock" :renderEditor = "state.renderTokensEditor" 
        @showSourceTextEditor = "showSourceTextEditor"  
        @showAlignmentGroupsEditor = "showAlignmentGroupsEditor"
    />

    <waiting />

    <upload-warn :updatedDTInDB = "state.updatedDTInDB"  
        @continue-upload-from-file = "continueUploadFromFile"   
        @continue-upload-from-indexeddb ="continueUploadFromIndexedDB"
      />
    <summary-block @start-align = "alignTexts" />
    <save-popup />
    <create-al-title @create-alignment = "createANewAlignment" />
  </div>
  
</template>
<script setup>
import DocumentUtility from '@/lib/utility/document-utility.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import SettingsController from '@/lib/controllers/settings-controller.js'
import Alignment from '@/lib/data/alignment'

import InitialScreen from '@/vue/initial-screen.vue'
import CreateAlTitle from '@/vue/modal-slots/create-al-title.vue'
import Waiting from '@/vue/modal-slots/waiting.vue'
import UploadWarn from '@/vue/modal-slots/upload-warn.vue'
import SummaryBlock from '@/vue/modal-slots/summary-block.vue'
import SavePopup from '@/vue/modal-slots/save-popup.vue'

import NotificationBar from '@/vue/common/notification-bar.vue'
import TextEditor from '@/vue/text-editor/text-editor.vue'
import AlignEditor from '@/vue/align-editor/align-editor.vue'
import TokensEditor from '@/vue/tokens-editor/tokens-editor.vue'

import MainMenu from '@/vue/main-menu.vue'
import NavbarIcon from '@/inline-icons/navbar.svg'

import { reactive, inject } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()

const $modal = inject('$modal')

const $textC = inject('$textC')
const $historyAGC = inject('$historyAGC')
const $tokensEC = inject('$tokensEC')
const $alignedGC = inject('$alignedGC')

const local = {
  fileData: null,
  extension: null,
  checkAlInDB: null
}

const state = reactive({ 
  updatedDTInDB: null,
  
  renderTokensEditor: 1,
  
  showInitialScreenBlock: true,
  showSourceTextEditorBlock: false,
  showAlignmentGroupsEditorBlock: false,
  showTokensEditorBlock: false,

  updateCurrentPage: 'initial-screen',

  menuShow: 1
})

const uploadDataFromFile = async (fileData, extension) => {
  if (fileData) {
    const shortAlData = $textC.extractIDandDateFromFile(fileData, extension)
    const checkAlInDB = shortAlData ? await $textC.checkShortAlInDB(shortAlData) : false

    if (shortAlData && checkAlInDB) {
      local.fileData = fileData
      local.extension = extension
      state.updatedDTInDB = checkAlInDB.updatedDT
      local.checkAlInDB = checkAlInDB


      $modal.show('upload-warn')
    } else {

      uploadDataFromFileFinal(fileData, extension)
    }    
  }
}

const uploadDataFromFileFinal = (fileData, extension) => {
  const alignment = $textC.uploadDataFromFile(fileData, SettingsController.tokenizerOptionValue, extension)

  if (alignment instanceof Alignment) {
    return startOver(alignment)
  }
  showSourceTextEditor()
}

const uploadDataFromDB = async (alData) => {
  if (alData) {
    $modal.show('waiting')
    const alignment = await $textC.uploadDataFromDB(alData)
    $modal.hide('waiting')
    if (alignment instanceof Alignment) {
      return startOver(alignment)
    } else {
      console.error('Something went wrong with uploading data - ', alignment)
    }
  }
  return true
}

const deleteDataFromDB = async (alData) => {
  if (alData) {
    $modal.show('waiting')
    const result = await $textC.deleteDataFromDB(alData)
    $modal.hide('waiting')
    return result
  }
}

const clearAllAlignmentsFromDB = async () => {
  $modal.show('waiting')
  const result = await $textC.clearAllAlignmentsFromDB()
  $modal.hide('waiting')
  return result
}

const newInitialAlignment = () => {
  $modal.show('createAlTitle')
}

const createANewAlignment = (alTitle) => {
  $textC.createAlignment(alTitle)
  $historyAGC.startTracking($textC.alignment)
  $textC.store.commit('incrementAlignmentRestarted')
  showSourceTextEditor()
}

const continueUploadFromFile = () => {
  uploadDataFromFileFinal(local.fileData, local.extension)
  clearUploadData()
}

const continueUploadFromIndexedDB = () => {
  uploadDataFromDB(local.checkAlInDB)
  clearUploadData()
}

const clearUploadData = () => {
  local.fileData = null
  local.extension = null
  state.updatedDTInDB = null
  local.checkAlInDB = null
}

const addTarget = () => {
  $textC.addNewTarget()
  showSourceTextEditor()
}

const showSourceTextEditor = () => {
  state.showSourceTextEditorBlock = true
  state.showAlignmentGroupsEditorBlock = false
  state.showTokensEditorBlock = false
  state.showInitialScreenBlock = false

  DocumentUtility.setPageClassToBody('text-editor')
  state.updateCurrentPage = 'text-editor'
}

const showSummaryPopup = async () => {
  if (!SettingsController.showSummaryPopup) {
    await alignTexts()
  } else {
    $modal.show('summary')
  }
}

const showAlignmentGroupsEditor = () => {
  state.showSourceTextEditorBlock = false
  state.showAlignmentGroupsEditorBlock = true
  state.showTokensEditorBlock = false
  state.showInitialScreenBlock = false

  DocumentUtility.setPageClassToBody('align-editor')
  state.updateCurrentPage = 'align-editor'
}

const showTokensEditor = () => {
  state.showSourceTextEditorBlock = false
  state.showAlignmentGroupsEditorBlock = false
  state.showTokensEditorBlock = true
  state.showInitialScreenBlock = false

  DocumentUtility.setPageClassToBody('tokens-editor')
  state.updateCurrentPage = 'tokens-editor'

  state.renderTokensEditor++
}

const showInitialScreen = () => {
  state.showSourceTextEditorBlock = false
  state.showAlignmentGroupsEditorBlock = false
  state.showTokensEditorBlock = false
  state.showInitialScreenBlock = true

  DocumentUtility.setPageClassToBody('initial')
  state.updateCurrentPage = 'initial'
}

const startOver = (alignment) => {
  if (alignment instanceof Alignment) {
    $textC.alignment = alignment
    $alignedGC.alignment = alignment
  } else {
    $textC.startOver()
    $alignedGC.startOver()
  }
  $historyAGC.startOver($textC.alignment)
  $tokensEC.startOver($textC.alignment)
  
  NotificationSingleton.clearNotifications()
  if (alignment instanceof Alignment) {
    $store.commit('incrementUploadCheck')
  } else {
    $store.commit('incrementAlignmentRestarted')
  }
  $store.commit('incrementDocSourceUpdated')

  if ((alignment instanceof Alignment) && alignment.hasOriginAlignedTexts) {
    showAlignmentGroupsEditor()
  } else {
    showSourceTextEditor()
  }
}

const clearAll = () => {
  NotificationSingleton.clearNotifications()
  $textC.store.commit('incrementReloadAlignmentsList')
  showInitialScreen()
}

const alignTexts = async () => {
  $modal.show('waiting')
  const result = await $alignedGC.createAlignedTexts($textC.alignment)
  $modal.hide('waiting')
  if (result) {
    $tokensEC.loadAlignment($textC.alignment)
    showAlignmentGroupsEditor()
  }
}

</script>
<style lang="scss">
.alpheios-header {
  padding: 10px 10px 10px 45px;
}

.alpheios-alignment-editor-container {
  padding: 15px 15px 0;

  h2 {
    margin: 0;
    padding: 0;
  }
}

.alpheios-alignment-app-menu-open-icon {
    display: block;
    position: fixed;
    top: 25px;
    left: 10px;
    width: 25px;
    height: 25px;
    cursor: pointer;


    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
}
</style> 