<template>
  <div class="alpheios-alignment-editor-text-blocks-single" v-show="dataUpdated" :id="containerId">
      <p class="alpheios-alignment-editor-text-blocks-single__title" 
         :class="{ 'alpheios-alignment-editor-text-blocks-single__title_less-margin': showAlignButton }">
        <span class="alpheios-alignment-editor-text-blocks-single__title-text">{{ indexData }}{{ textTypeFormatted }}</span>
        <span id="alpheios-alignment-editor-add-translation" class="alpheios-alignment-editor-add-translation" v-show="showAddTranslation" 
              @click="$emit('add-translation')">
          <plus-icon />
        </span>
        <span class="alpheios-alignment-editor-text-blocks-single__align-button" v-show="showAlignButton">
          <tooltip :tooltipText="l10n.getMsgS('ALIGN_TEXT_BUTTON_TOOLTIP')" tooltipDirection="top">
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button-align"  id="alpheios-actions-menu-button__align"
                @click="$emit('align-text')" :disabled="!alignAvailable" >
                {{ l10n.getMsgS('MAIN_MENU_ALIGN_TITLE') }}
            </button>
          </tooltip>
        </span>
      </p>
      
      <div class="alpheios-alignment-editor-text-blocks-single__first-line" v-show="state.showTypeUploadButtons" >
        <span class="alpheios-alignment-editor-text-blocks-single__type-label">{{ l10n.getMsgS('TEXT_SINGLE_TYPE_LABEL') }}</span>
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button"  id="alpheios-actions-menu-button__uploadtext"
            @click="selectUploadText" v-show="enableDTSAPIUploadValue">
            {{ l10n.getMsgS('TEXT_SINGLE_UPLOAD_BUTTON') }}
        </button>
      </div>

      <div class="alpheios-alignment-editor-actions-menu__upload-block" v-show="state.showUploadMenu" >
          <input type="file" :id = "fileUploadId" :ref="el => (fileUploadRef = el)" class="alpheios-fileupload" @change="loadTextFromFile">
          <label :for="fileUploadId" class="alpheios-fileupload-label alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-upload">
              {{ l10n.getMsgS('INITIAL_CHOOSE_FILE') }} 
          </label>
          <span class="alpheios-fileupload-label-filename" v-if="state.uploadFile">{{ state.uploadFile }}</span>

          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-fileupload-dtsapi" id="alpheios-actions-menu-button__metadata"
              @click="$modal.show(modalNameDTSAPI)" v-if="enableDTSAPIUploadValue">
              DTSAPI
          </button>
      </div>

      <div v-show="state.showTypeTextBlock" class="alpheios-alignment-editor-text-blocks-single-text-area-container">
        <p class="alpheios-alignment-editor-text-blocks-info-line">
          <span class="alpheios-alignment-editor-text-blocks-single__characters" :class = "charactersClasses">{{ charactersText }}</span>

          <span class="alpheios-alignment-editor-text-blocks-single__lang-icon" 
                :class="sourceTypeIconClass" v-show="enableTEXTXMLIconValue && state.showTextProps" 
                @click="clickSourceType"> {{ formattedSourceType }} </span>
          <span class="alpheios-alignment-editor-text-blocks-single__lang-icon" v-show="enableChangeLanguageIconValue && state.showTextProps" 
                @click="$modal.show(modalNameLanguage)"> 
                    {{ language }} 
          </span>
          <span class="alpheios-alignment-editor-text-blocks-single__icons" v-show="enableChangeLanguageIconValue && showLangNotDetected">
            <tooltip :tooltipText="l10n.getMsgS('NO_LANG_DETECTED_ICON')" tooltipDirection="top">
              <no-lang-detected-icon />
            </tooltip>
          </span>

          <metadata-icons :text-type = "props.textType" :text-id = "props.textId" 
                           @showModalMetadata = "$modal.show(modalNameMetadata)" />
      
        </p>
        <span :id="removeId" class="alpheios-alignment-editor-text-blocks-single__remove" 
              v-show="showDeleteIcon" @click="deleteText">
          <x-close-icon />
        </span>
        <textarea :id="textareaId" v-model="state.text" :dir="direction" tabindex="2" :lang="language" 
                  @blur="updateTextFromTextBlock()" 
                  :disabled="!docSourceEditAvailable" class="alpheios-alignment-editor-text-blocks-textarea">
        ></textarea>
      </div>


      <div class="alpheios-alignment-editor-text-blocks-single__describe-button" >
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button"  :id="describeButtonId"
              @click="$modal.show(modalNameMetadata)" :disabled="!isMetadataAvailable" >
              {{ l10n.getMsgS('DESCRIBE_BUTTON_TITLE') }}
          </button>
      </div>


 
      <source-type-block :text-type = "props.textType" :text-id = "props.textId" 
            :localOptions = "updatedLocalOptions" @updateText = "updateText" 
        />

      <language-direction-block :text-type = "props.textType" :text-id = "props.textId" :localOptions = "updatedLocalOptions" 
                        @updateText = "updateText" @updateDirection = "updateDirection"
        />

      <metadata-block :text-type = "props.textType" :text-id = "props.textId" :modalName = "modalNameMetadata"
        />
      
      <upload-dtsapi-block @uploadFromDTSAPI = "uploadFromDTSAPI" :modalName="modalNameDTSAPI"  />

  </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import XCloseIcon from '@/inline-icons/xclose.svg'
import NoMetadataIcon from '@/inline-icons/no-metadata.svg'
import HasMetadataIcon from '@/inline-icons/has-metadata.svg'
import NoLangDetectedIcon from '@/inline-icons/no-lang-detected.svg'
import PlusIcon from '@/inline-icons/plus.svg'
import MetadataIcons from '@/vue/common/metadata-icons.vue'

import SourceTypeBlock from '@/vue/text-editor/modal_slots/source-type-block.vue'
import LanguageDirectionBlock from '@/vue/text-editor/modal_slots/language-direction-block.vue'
import MetadataBlock from '@/vue/text-editor/modal_slots/metadata/metadata-block.vue'
import UploadDtsapiBlock from '@/vue/text-editor/modal_slots/dtsapi/upload-dtsapi-block.vue'

import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'

import Tooltip from '@/vue/common/tooltip.vue'
import Langs from '@/lib/data/langs/langs.js'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits([ 'add-translation', 'align-text' ])

const l10n = computed(() => { return L10nSingleton })
const $store = useStore()

const $modal = inject('$modal')

const props = defineProps({
  textType: {
    type: String,
    required: true
  },
  textId: {
    type: String,
    required: false
  },
  index: {
    type: Number,
    required: false,
    default: 0
  }
})

const state = reactive({
  text: '',

  localTextEditorOptions: { ready: false },
  showTypeUploadButtons: true,

  showTypeTextBlock: true,
  showTextProps: false,
  showUploadMenu: false,
  
  updatedLocalOptionsFlag: 1,
  uploadFile: ''
})


let fileUploadRef = ref(null)
const $textC = inject('$textC')

onMounted(async () => {
  if (!state.localTextEditorOptions.ready && SettingsController.tokenizerOptionsLoaded) {
    prepareDefaultTextEditorOptions()
  }
  initDataProps()
  await updateFromExternal()
})

watch(
  () => $store.state.optionsUpdated,
  async () => {
    if (!state.localTextEditorOptions.ready && SettingsController.tokenizerOptionsLoaded) {
      prepareDefaultTextEditorOptions()
    }
    if (state.text.length === 0) {
      initDataProps()
    }
  }
)

watch(
  () => $store.state.uploadCheck,
  async () => {
    await updateFromExternal()
    if (fileUploadRef.value) {
      fileUploadRef.value.value = ''
    }
    state.uploadFile = ''
  }
)

watch(
  () => $store.state.docSourceLangDetected,
  () => { updateLangData() }
)

watch(
  () => $store.state.alignmentRestarted,
  () => { restartTextEditor() }
)

watch(
  () => $store.state.resetOptions,
  async () => { await updateText() }
)

watch(
  () => $store.state.tokenizerUpdated,
  async () => { prepareDefaultTextEditorOptions() }
)

const formattedTextId  = computed(() => props.textId ?? 'no-id' )
const formattedPrefix = computed(() => `${props.textType}-${formattedTextId.value}`)

const modalNameSourceType = computed(() => {
  return `source-type-${formattedPrefix.value}`
})
const modalNameLanguage = computed(() => {
  return `language-${formattedPrefix.value}`
})
const modalNameMetadata = computed(() => {
  return `metadata-${formattedPrefix.value}`
})
const modalNameDTSAPI = computed(() => {
  return `dtsapi-${formattedPrefix.value}`
})

const fileUploadId = computed(() => `fileupload-${formattedPrefix.value}` )

const dataUpdated = computed(() => {
  if (!state.localTextEditorOptions.ready && SettingsController.tokenizerOptionsLoaded) {
    prepareDefaultTextEditorOptions()
  }
  return $store.state.docSourceUpdated
})
const languageModalName = computed(() => {
  return `language-${props.textType}-${formattedTextId}`
})

const metadataModalName = computed(() => {
  return `metadata-enter-${props.textType}-${formattedTextId}`
})

const sourceTypeModalName = computed(() => {
  return `sourceType-${props.textType}-${formattedTextId}`
})

const uploadDtsModalName = computed(() => {
  return `upload-dts-${props.textType}-${formattedTextId}`
})

const containerId = computed(() => {
  return `alpheios-alignment-editor-text-blocks-single__${formattedPrefix.value}`
})

const textareaId = computed(() => {
  return `alpheios-alignment-editor-text-blocks-single__textarea_${formattedPrefix.value}`
})

const removeId = computed(() => {
  return `alpheios-alignment-editor-text-blocks-single__remove_${formattedPrefix.value}`
})

const enableDTSAPIUploadValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableDTSAPIUpload
})

const direction = computed(() => {
  return $store.state.optionsUpdated && $store.state.docSourceUpdated && state.localTextEditorOptions.ready && state.localTextEditorOptions.sourceText.items.direction.currentValue
})

const language = computed(() => {
  return $store.state.optionsUpdated && $store.state.docSourceUpdated && state.localTextEditorOptions.ready && state.localTextEditorOptions.sourceText.items.language.currentValue
})

const showAddTranslation = computed(() => {
  return $store.state.docSourceUpdated && (props.textType === 'target') 
         && (props.index === ($textC.allTargetTextsIds.length - 1)) && (state.text.length > 0)
})

const showAlignButton = computed(() => {
  return showAddTranslation.value
})

const alignAvailable = computed(() => {
  return $store.state.docSourceUpdated && $store.state.optionsUpdated && $store.state.alignmentUpdated && $textC.couldStartAlign && $textC.checkSize()
})

const showIndex = computed(() => {
  return (props.textType === 'target') && $store.state.docSourceUpdated && $textC.allTargetTextsIds.length > 1 
})

const indexData = computed(() => {
  return showIndex.value ? `${props.index + 1}. ` : ''
})

const textTypeFormatted = computed(() => {
  if (props.textType === 'origin') {
    return 'Original'
  }
  if (props.textType === 'target') {
    return 'Translation'
  }
})

const textCharactersAmount = computed(() => {
  return state.text ? state.text.length : 0
})

const sourceType = computed(() => {
  return $store.state.optionsUpdated && $store.state.docSourceUpdated && 
         state.localTextEditorOptions.ready && state.localTextEditorOptions.sourceText.items.sourceType.currentValue
})

const addIndexedDBSupportValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.addIndexedDBSupport
})

const checkTextCharactersAmount = computed(() => {
      return !addIndexedDBSupportValue.value
})

const maxCharactersForTheText = computed(() => {
  return $store.state.optionsUpdated && SettingsController.maxCharactersPerTextValue
})

const charactersClasses = computed(() => {
  return {
    'alpheios-alignment-editor-hidden' : (textCharactersAmount.value === 0),
    'alpheios-alignment-editor-red' : sourceType.value === 'text' && checkTextCharactersAmount.value && 
                                      (textCharactersAmount.value > maxCharactersForTheText.value)
  }
})

const charactersText = computed(() => {
  if (addIndexedDBSupportValue.value) {
    return `Characters count - ${textCharactersAmount.value}`
  } else {
    return `Characters count - ${textCharactersAmount} (max - ${maxCharactersForTheText.value})`
  }
})

const sourceTypeDisabled = computed(() => {
  return $store.state.optionsUpdated && !SettingsController.hasSourceTypeOptions
})

const sourceTypeIconClass = computed(() => {
  return {
    'alpheios-alignment-editor-text-blocks-single__lang-icon_disabled': sourceTypeDisabled.value
  }
})


const formattedSourceType = computed(() => {
  return sourceType.value === 'tei' ? 'xml' : sourceType.value
})

const enableTEXTXMLIconValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableTEXTXMLIcon
})

const enableChangeLanguageIconValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableChangeLanguageIcon
})

const docSourceEditAvailable = computed(() => {
  return $store.state.docSourceUpdated && $store.state.alignmentUpdated &&
          !$textC.sourceTextIsAlreadyTokenized(props.textType, props.textId)
})

const showDeleteIcon = computed(() => {
  return docSourceEditAvailable.value && (showIndex.value || (state.text && (state.text.length > 0)))
})

const showLangNotDetected = computed(() => {
  const docSource = $textC.getDocSource(props.textType, props.textId)
  return $store.state.docSourceLangDetected && docSource && 
         (!docSource.skipDetected && !docSource.detectedLang && docSource.text.length > 0)
})

const describeButtonId = computed(() => {
  return `alpheios-actions-menu-button__describe-${formattedPrefix.value}-id`
})

const isMetadataAvailable = computed(() => {
  const docSource = $textC.getDocSource(props.textType, props.textId)
  return $store.state.docSourceUpdated && docSource
})

const updateTextMethod = computed(() => {
  return props.textType === 'origin' ? 'updateOriginDocSource' : 'updateTargetDocSource'
})

const tokenization = computed(() => {
  return TokenizeController.defineTextTokenizationOptions(SettingsController.tokenizerOptionValue, state.localTextEditorOptions[sourceType.value])
})

const updatedLocalOptions = computed(() => {
  return state.updatedLocalOptionsFlag && state.localTextEditorOptions
})

const prepareDefaultTextEditorOptions = () => {
  state.localTextEditorOptions = SettingsController.cloneTextEditorOptions(props.textType, props.index)

  state.localTextEditorOptions.ready = true
  $store.commit('incrementOptionsUpdated')
}

const initDataProps = () => {
  state.showTypeUploadButtons = true

  state.showTextProps = false
  state.showUploadMenu = !enableDTSAPIUploadValue.value
}

const updateFromExternal = async () => {
  const sourceTextData = $textC.getDocSource(props.textType, props.textId)

  if (sourceTextData && sourceTextData.text) {
    state.text = sourceTextData.text
    SettingsController.updateLocalTextEditorOptions(state.localTextEditorOptions, sourceTextData)
    await updateText()
    state.showTypeUploadButtons = false
    state.showUploadMenu = false
  }
}

const updateText = async () => {
  if (state.text) {
    const params = {
      text: state.text,
      direction: direction.value,
      lang: language.value,
      id: props.textId,
      sourceType: sourceType.value,
      tokenization: tokenization.value
    }

    const result = await $textC[updateTextMethod.value](params, props.textId)  

    if ($textC.checkDetectedProps(props.textType, props.textId) || (state.text && state.text.length > 0)) {
      state.showTypeUploadButtons = false
      state.showTextProps = true
      state.showUploadMenu = false
    }
  }
}

const selectUploadText = () => { 
  state.showUploadMenu = true
  state.showTypeUploadButtons = false
}

const loadTextFromFile = (ev) => {
  const file = fileUploadRef.value.files[0]     
  
  if (!file) { return }
 
  state.uploadFile = file.name
  const extension = file.name.indexOf('.') > -1 ? file.name.split('.').pop() : ''

  if (!$textC.checkUploadedFileByExtension(extension, false)) { return }

  const reader = new FileReader()

  reader.onload = e => {
    uploadSingle({ text: e.target.result, extension })
    state.showUploadMenu = false
  }
  reader.readAsText(file)

  fileUploadRef.value.value = ''
  state.uploadFile = ''
}

const uploadSingle = async (fileData) => {
  const result = await $textC.uploadDocSourceFromFileSingle(fileData, {
    textType: props.textType,
    textId: props.textId
  })
  if (result.resultUpdate) {
    state.showTypeTextBlock = true
  } else {
    state.showTypeUploadButtons = true
    state.showTextProps = false
    state.showUploadMenu = false || !enableDTSAPIUploadValue.value
  }
}

const clickSourceType = () => {
  if (!sourceTypeDisabled.value) {
    $modal.show(modalNameSourceType.value)
  }
}

const restartTextEditor = async () => {
  state.text = ''
  fileUploadRef.value.value = ''
  state.uploadFile = ''
  prepareDefaultTextEditorOptions()

  initDataProps()
  $textC.deleteText(props.textType, props.textId)
}

const collectCurrentParams = () => {
  return {
    text: state.text,
    direction: direction.value,
    lang: language.value,
    id: props.textId,
    sourceType: sourceType.value,
    tokenization: tokenization.value
  }
}

const updateTextFromTextBlock = async () => {
  const docSource = $textC.getDocSource(props.textType, props.textId)

  if (!docSource && (state.text.length === 0)) { return }

  const params = collectCurrentParams()
  const result = await $textC[updateTextMethod.value](params, props.textId)
  if (!result.resultUpdate) {
    state.text = ''
  }

  if (result.resultUpdate && (state.showTypeUploadButtons || state.showUploadMenu) && (state.text.length !== 0)) {

    setTimeout(() => {
      state.showTypeUploadButtons = false
      state.showTextProps = true
      state.showUploadMenu = false
    }, 100)
    
  }
}

const updateLangData = () => {
  const sourceTextData = $textC.getDocSource(props.textType, props.textId)
  if (sourceTextData) {
    state.localTextEditorOptions.sourceText.items.direction.currentValue = sourceTextData.direction
    state.localTextEditorOptions.sourceText.items.language.currentValue = sourceTextData.lang
    state.localTextEditorOptions.sourceText.items.sourceType.currentValue = sourceTextData.sourceType
    $store.commit('incrementOptionsUpdated')
  }
}

const updateDirection = () => {
  state.localTextEditorOptions.sourceText.items.direction.currentValue = Langs.defineDirection(state.localTextEditorOptions.sourceText.items.language.currentValue)
  $store.commit('incrementOptionsUpdated')
}

const deleteText = async () => {
  state.text = ''
  fileUploadRef.value.value = ''
  state.uploadFile = ''
  prepareDefaultTextEditorOptions()
  $textC.deleteText(props.textType, props.textId)
  setTimeout(() => {
    state.showTypeUploadButtons = true
    state.showUploadMenu = false || !enableDTSAPIUploadValue.value
  }, 150)
}

const uploadFromDTSAPI = (filedata) => {
  state.localTextEditorOptions.sourceText.items.sourceType.setValue('tei')
  uploadSingle({ text: filedata.tei, lang: filedata.lang, extension: filedata.extension })
  state.showUploadMenu = false
}

</script>

<style lang="scss">
    .alpheios-alignment-editor-hidden {
      visibility: hidden;
    }
  
    .alpheios-alignment-editor-text-blocks-single {
        textarea {
            width:100%;
            min-height: 300px;
            font-size: inherit;
        }

        p {
            margin-bottom: 10px;
        }

        p.alpheios-alignment-editor-text-blocks-info-line {
          margin: 0;

          &:before,
          &:after {
            clear: both;
            content: '';
            display: table;
          }
        }
        span.alpheios-alignment-editor-text-blocks-single__characters {
          color: #888;
          font-size: 90%;
          display: block;
          float: left;
          padding: 10px 0;
        }
        span.alpheios-alignment-editor-text-blocks-single__icons {
          display: block;
          float: right;
          padding: 5px;

          svg {
            display: block;
            width: 30px;
            height: 30px;
            stroke: #99002a;
            fill: transparent;
          }
        }

        span.alpheios-alignment-editor-text-blocks-single__icons{

          &.alpheios-alignment-editor-text-blocks-single__metadata_icon_no_data {
            cursor: pointer;
            svg {
              stroke: #99002a;
            }
          }

          &.alpheios-alignment-editor-text-blocks-single__metadata_icon_has_data {
            cursor: pointer;
            svg {
              stroke: #2a9900;
            }
          }
        }

        span.alpheios-alignment-editor-red {
          color: #99002a;
        }

        .alpheios-alignment-editor-text-blocks-single__lang-icon {
          display: block;
          float: right;

          font-weight: bold;
          padding: 3px;
          border: 2px solid #000;
          border-radius: 30px;
          font-size: 13px;
          margin-top: 5px;
          margin-left: 3px;

          cursor: pointer;

          min-width: 33px;
          text-align: center;

          &.alpheios-alignment-editor-text-blocks-single__lang-icon_disabled {
            cursor: initial;
            color: #9a9a9a;
            border-color: #9a9a9a;
          }
        }
    }

    .alpheios-alignment-editor-text-blocks-single__title {
      position: relative;
      font-size: 20px;
      font-weight: bold;

      &.alpheios-alignment-editor-text-blocks-single__title_less-margin {
        margin-bottom: 7px;
      }
    }


    .alpheios-alignment-editor-add-translation {
      display: inline-block;
      width: 25px;
      height: 25px;

      cursor: pointer;
      svg {
        display: inline-block;
        width: 100%;
        height: 100%;
      }
    }

    .alpheios-alignment-editor-options-fieldset {
      padding: 10px;
      border: 2px groove #f8f8f8;
      margin-bottom: 30px;

      legend {
        display: block;
        padding: 0 10px;
        margin-bottom: 10px;
        line-height: inherit;
        color: inherit;
        white-space: normal;
        font-size: 110%;
      }
    }

    .alpheios-alignment-editor-options-fieldset-slim {
      padding: 0;
      margin-bottom: 0;
      border: 0;

      legend {
        display: none;
      }
    }

    .alpheios-alignment-editor-options-fieldset-label-auto {
      .alpheios-alignment-option-item__label {
        width: auto;
        margin-right: 20px;
      }
      input.alpheios-alignment-input, 
      .alpheios-alignment-select, 
      .alpheios-alignment-radio-block {
        width: auto;
      }
    }

    .alpheios-alignment-editor-text-blocks-single__type-label {
      display: inline-block;
      padding-right: 15px;
    }

    .alpheios-alignment-editor-text-blocks-single__title {
      position: relative;

      .alpheios-alignment-editor-text-blocks-single__title-text {
        display: inline-block; 
        padding-right: 15px;
        line-height: 35px;
      }

      .alpheios-alignment-editor-add-translation {
        position: relative;
        top: 5px;
      }
    }

    .alpheios-alignment-editor-text-blocks-textarea {
      padding: 10px 55px 10px 10px;
    }

    .alpheios-alignment-editor-text-blocks-single-text-area-container {
      position: relative;

      .alpheios-alignment-editor-text-blocks-single__remove {
        top: 55px;
        right: 25px;
        fill: #ddd;

        display: inline-block;
        width: 20px;
        height: 20px;

        position: absolute;

        cursor: pointer;
        svg {
          display: inline-block;
          width: 100%;
          height: 100%;
        }
      }
    }

  .alpheios-alignment-editor-text-blocks-single__align-button {
    text-align: right;
    display: inline-block;
    padding-left: 20px;
  }

  .alpheios-alignment-editor-text-blocks-single__describe-button {
    text-align: center;
    margin-top: 10px;
  }

  .alpheios-alignment-editor-text-blocks-single__first-line,
  .alpheios-alignment-editor-actions-menu__upload-block {
    display: inline-block;
  }

  .alpheios-alignment-editor-actions-menu__upload-block {
    .alpheios-fileupload-label-filename {
      padding: 0 20px;
      color: #46788d;
    }

    .alpheios-fileupload-dtsapi {
      margin-left: 20px;
    }
  }
</style>
