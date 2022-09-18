<template>
  <div id="alpheios-main-menu">
    <div class="alpheios-alignment-app-menu" :class="{ 'alpheios-shown': state.menuShown }">
      <span class="alpheios-alignment-app-menu-close-icon" @click = "closeMenu">
        <x-close-icon />
      </span>
      <div class="alpheios-alignment-app-menu__buttons">
        <div class="alpheios-alignment-app-menu__buttons-actions">

          <button class="alpheios-app-menu-link" id ="alpheios-main-menu-to-home" 
                  @click="reloadPage">
                  {{ l10n.getMsgS('TO_HOME') }}
          </button>

          <button class="alpheios-app-menu-link" id ="alpheios-main-menu-clear-all" 
                  @click="newInitialAlignment">
                  {{ l10n.getMsgS('INITIAL_NEW_ALIGNMENT') }}
          </button>

          <button class="alpheios-app-menu-link" id ="alpheios-main-menu-upload" 
                  @click="uploadTexts"  >
                  {{ l10n.getMsgS('MAIN_MENU_UPLOAD_TITLE') }}
          </button>

          <div class="alpheios-alignment-app-menu__upload-block" id="alpheios-main-menu-upload-block" v-show="state.showUploadBlock" >
            <span class="alpheios-main-menu-upload-block_item">
              <input type="file" id = "alpheiosfileuploadpage" ref="alpheiosfileuploadpage"  class="alpheios-fileupload" @change="loadTextFromFile">
              <label for="alpheiosfileuploadpage" class="alpheios-fileupload-label alpheios-editor-button-tertiary alpheios-actions-menu-button">
                {{ l10n.getMsgS('MAIN_MENU_CHOOSE_FILE') }}                
              </label>
            </span>
            <span> OR upload autosaved</span>
          </div>
        
          <div class="alpheios-alignment-editor-initial-screen__alignments-container" v-show="state.showUploadBlock" v-if="indexedDBAvailable">
            <Suspense>
              <alignments-list 
                  :menuVersion = "true"
                  @upload-data-from-db="uploadDataFromDB"
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div> <!--alpheios-alignment-app-menu-->
      <div class="alpheios-app-black-screen" v-show="state.menuShown"></div>
  </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import DownloadController from '@/lib/controllers/download-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'

import DownloadIcon from '@/inline-icons/download.svg'
import UploadIcon from '@/inline-icons/upload.svg'
import XCloseIcon from '@/inline-icons/xclose.svg'
import Tooltip from '@/vue/common/tooltip.vue'

import AlignmentsList from '@/vue/alignments-list.vue'

import { reactive, ref, inject, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

const alpheiosfileuploadpage = ref(null)

const $store = useStore()
const $textC = inject('$textC')
const $historyAGC = inject('$historyAGC')
const $alignedGC = inject('$alignedGC')

const l10n = computed(() => { return L10nSingleton })

const emit = defineEmits([ 'upload-data-from-db', 'upload-data-from-file', 'clear-all', 'new-initial-alignment' ])


const props = defineProps({
  menuShow: {
    type: Number,
    required: true
  },
  updateCurrentPage: {
    type: String,
    required: false,
    default: ''
  }
})

const state = reactive({
  menuShown: false,
  showUploadBlock: false,
  uploadFileName: null,
  currentPage: 'initial-page'
})

watch(
  () => props.menuShow,
  () => { state.menuShown = true }
)

watch(
  () => props.updateCurrentPage,
  (value) => { state.currentPage = value }
)

onMounted(() => {
})


const indexedDBAvailable = computed(() => {
  return $textC.indexedDBAvailable
})

const uploadTexts = () => {
  state.showUploadBlock = !state.showUploadBlock
}

const loadTextFromFile = () => {
  const file = alpheiosfileuploadpage.value.files[0]

  if (!file) { return }
  const extension = file.name.indexOf('.') > -1 ? file.name.split('.').pop() : ''

  if (!$textC.checkUploadedFileByExtension(extension)) { 
    closeMenu()
    return 
  }

  const reader = new FileReader()

  reader.onload = e => {
    emit("upload-data-from-file", e.target.result, extension)
    state.showUploadBlock = false
    alpheiosfileuploadpage.value.value = ''
    closeMenu()
  }
  reader.readAsText(file)
}

const newInitialAlignment = () => {
  clearAll()
  emit("new-initial-alignment")
}

const clearAll = () => {
  alpheiosfileuploadpage.value.value = ''
  state.showUploadBlock = false
  emit('clear-all')

  state.currentPage = 'initial-page'
  closeMenu()
}

const reloadPage = () => {
  location.reload(true)
}

const closeMenu = () => {
  state.menuShown = false
}

const changeFileUpload = () => {
  const file = alpheiosfileuploadpage.value.files[0]

  if (!file) { return }
  state.uploadFileName = file.name
}

const uploadDataFromDB = (alData) => {
  emit('upload-data-from-db', alData)
  state.showUploadBlock = false
  closeMenu()
}

</script>


<style lang="scss">
  .alpheios-alignment-app-menu {
      height: 100%; 
      width: 400px; 
      position: fixed; 
      z-index: 10000;
      top: 0; 
      left: -400px;
      background-color: #e0e0e0; 
      overflow-x: hidden; 
       
      transition: left 0.5s; 

      &.alpheios-shown {
        left: 0;
      }

      .alpheios-alignment-app-menu__buttons {
        padding: 70px 20px 10px;
      }
      .alpheios-alignment-app-menu-close-icon {
        display: block;
        position: absolute;
        top: 25px;
        right: 25px;
        width: 25px;
        height: 25px;
        cursor: pointer;

        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      }
  }

  .alpheios-app-menu-link {
    display: block;
    padding: 7px 0;
    cursor: pointer;
    white-space: nowrap;
  }

  .alpheios-alignment-app-menu__upload-block {
    text-align: left;

    padding: 10px 0;
    border-top: 2px solid #ddd;
    // border-bottom: 2px solid #ddd;
  }

  .alpheios-main-menu-upload-block-radio-block_item,
  .alpheios-main-menu-upload-block_item {
    padding-right: 20px; 
  }

  .alpheios-main-menu-upload-block_item {
    text-align: center;

    &.alpheios-token-edit-actions-button {
      width: 30px;
      height: 30px;
      border-radius: 30px;
      line-height: 30px;
      padding: 5px;
    }
  }

  button.alpheios-app-menu-link {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
    overflow: visible;
    text-transform: none;
    -webkit-appearance: button;
    background: transparent;
    border: 0;
    outline: 0;

    &.alpheios-app-menu-link-current {
      font-weight: bold;
      text-shadow: 1px 1px #eee;
    }
  }

  button.alpheios-app-menu-link::-moz-focus-inner {
    border-style: none;
    padding: 0;
  }

  button.alpheios-app-menu-link:-moz-focusring {
    outline: 1px dotted ButtonText;
  }

  .alpheios-fileupload {
    opacity: 0;
    width: 0.1px;
    height: 0.1px;
    position: absolute;
  }

  .alpheios-fileupload-label {
    display: inline-block;
  }

  .alpheios-alignment-app-menu__buttons-blocks {
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }

  .alpheios-app-black-screen {
    height: 100%; 
    width: 100%; 
    position: fixed; 
    z-index: 90;
    top: 0;
    left: 0;

    opacity: 0.6;
    background: #000;
    transition: 0.6s;
  }
</style>

