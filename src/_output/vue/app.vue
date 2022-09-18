<template>
    <div class="alpheios-app-container">

      <main-menu 
        :menuShow = "state.menuShow"
        @changeOrder = "changeOrder" 
        @updateVisibility = "updateVisibility"
        @updateViewType = "updateViewType"
        :onlyFilter = "true"
        :currentView = "state.viewType"
        :allViewTypes = "state.allViewTypes"
      />

        <div class="header alpheios-header">
            <div class="alpheios-header-logo">
                <img :src="state.alpheiosLogoOnlyPNG" class="alpheios-logo-1">
                <img :src="state.alpheiosLogoBlackPNG" class="alpheios-logo-2">
            </div>
            <div class="alpheios-header-title">
                <h1>Alpheios Alignment Editor</h1>
            </div>
        </div>

        <div id="alpheios-alignment-editor-container" class="alpheios-alignment-editor-container ">
            <div class="alpheios-alignment-editor-container-top-line" >
              <span class="alpheios-alignment-app-menu-open-icon" @click = "state.menuShow++" 
                     v-if="state.identList['viewFull'].length > 1">
                <navbar-icon />
              </span>

              <select-views @updateViewType = "updateViewType" :inHeader = "true" :allViewTypes = "state.allViewTypes" />

              <div class="alpheios-alignment-editor-container-question-button">
                <tooltip tooltipText = "Help" tooltipDirection = "left">
                    <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-with-icon" id="alpheios-actions-menu-button__enter-help"
                        @click="$modal.show('help-output')" >
                        <span class="alpheios-alignment-button-icon">
                        <question-icon />
                        </span>
                    </button>
                </tooltip>
              </div>
            </div>
            <p class="alpheios-alignment-editor-container__view-notice" v-html="noticeText"></p>

            <al-groups-view-full :identList = "state.identList[state.viewType]" 
                  v-if="state.viewType === 'viewFull'" />
            <al-groups-view-columns :identList = "state.identList[state.viewType]"  
                  v-if="state.viewType === 'view3Columns'" />
            <al-groups-view-short :identList = "state.identList[state.viewType]"  
                  v-if="state.viewType === 'viewShort'" />

            <al-groups-view-sentence :identList = "state.identList[state.viewType]"  
                  :sentence-count = "state.sentenceCount" v-if="state.viewType === 'viewSentence'" />

            <al-groups-view-equivalence :identList = "state.identList[state.viewType]"  
                  v-if="state.viewType === 'viewEquivalence'" />

            <al-groups-view-interlinearly :identList = "state.identList[state.viewType]"  
                  v-if="state.viewType === 'viewInterlinearly'" />

        </div>

        <annotation-block />

    
    <help-popup  />
    </div>
</template>
<script setup>
import GroupUtility from '@/_output/utility/group-utility.js'
import SourceData from '@/_output/data/source-data.js'

import AnnotationBlock from '@/_output/vue/annotation-block.vue'

import AlGroupsViewFull from '@/_output/vue/views/al-groups-view-full.vue'
import AlGroupsViewShort from '@/_output/vue/views/al-groups-view-short.vue'
import AlGroupsViewSentence from '@/_output/vue/views/al-groups-view-sentence.vue'
import AlGroupsViewEquivalence from '@/_output/vue/views/al-groups-view-equivalence.vue'
import AlGroupsViewColumns from '@/_output/vue/views/al-groups-view-columns.vue'
import AlGroupsViewInterlinearly from '@/_output/vue/views/al-groups-view-interlinearly.vue'

import QuestionIcon from '@/_output/inline-icons/question.svg'
import Tooltip from '@/_output/vue/common/tooltip.vue'

import HelpPopup from '@/_output/vue/help-popup.vue'
import MainMenu from '@/_output/vue/main-menu.vue'
import SelectViews from '@/_output/vue/select-views.vue'

import NavbarIcon from '@/_output/inline-icons/navbar.svg'

import ImagesConverted from '@/_output/data/images-converted.js'

import { computed, reactive, inject, onMounted } from 'vue'

const $fullData = inject('$fullData')
const $modal = inject('$modal')

const state = reactive({
  viewType: 'viewFull',
  sentenceCount: 0,
  identList: {
    viewFull: [],
    view3Columns: [],
    viewShort: [],
    viewEquivalence: [],
    viewInterlinearly: [],
    viewSentence: [],
    windowWidth: window.innerWidth
  },
  menuShow: 1,
  allViewTypes: [
    { value: 'viewFull', label: '2 columns'},
    { value: 'view3Columns', label: '3 columns'},
    { value: 'viewShort', label: 'Short'},
    { value: 'viewEquivalence', label: 'All equivalents'},
    { value: 'viewInterlinearly', label: 'Interlinear'},
    { value: 'viewSentence', label: 'Sentence Context'}
  ],

  alpheiosLogoOnlyPNG: ImagesConverted.alpheiosLogoOnlyPNG,
  alpheiosLogoBlackPNG: ImagesConverted.alpheiosLogoBlackPNG
})


onMounted(() => {
  Object.keys(state.identList).forEach(viewType => {
    state.identList[viewType] = GroupUtility.allIdentificationTargets($fullData, viewType)
  })
  
  state.viewType = state.allViewTypes[0].value
})

const shownTabs = computed(() => {
  return state.identList[state.viewType].filter(langData => !langData.hidden)
})

const noticeText = computed(() => {
  return `This view displays the first <b>${shownTabs.value.length}</b> of the <b>${state.identList[state.viewType].length}</b> translations available. The menu in the upper left lets you change the selection and their order.`
})

const changeOrder = (data) => {
  state.identList[data.view].sort((a, b) => {
    return data.identsList.indexOf(a.targetId) - data.identsList.indexOf(b.targetId)
  })
}

const updateVisibility = (data) => {
  state.identList[data.view].find(curLangData => curLangData.targetId === data.identData.targetId).hidden = data.identData.hidden
}

const updateViewType = ({ viewType, sentenceCount }) => {
  state.viewType = viewType
  state.sentenceCount = sentenceCount ? sentenceCount : 0
}

</script>

<style lang="scss">
    .alpheios-header {
      display: flex;
      justify-content: space-between;
    }
    .alpheios-alignment-editor-container {
        padding: 15px;
        height: calc(100% - 110px);
    }

    button.alpheios-actions-menu-button.alpheios-actions-menu-button-with-icon {
      padding: 5px;
      margin: 10px 5px 0;
      .alpheios-alignment-button-icon {
          display: inline-block;
          width: 20px;
          height: 20px;

          svg {
            width: 100%;
            height: 100%;
            display: block;
            fill: #fff;
          }
      }
    }
    .alpheios-alignment-app-menu-open-icon {
        display: block;
        position: fixed;
        top: 25px;
        left: 15px;
        width: 25px;
        height: 25px;
        cursor: pointer;


        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
    }

    .alpheios-alignment-editor-container__view-notice {
      text-align: right;
      margin-top: 0;
      font-size: 90%;
      color: #808080;

      b {
        font-size: 100%;
        color: #000;
      }
    }

    .alpheios-alignment-editor-container-top-line {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;

      .alpheios-alignment-editor-container-question-button {
        .alpheios-actions-menu-button {
          margin: 2px 0 0 40px;
        }
      }
    }

</style>
