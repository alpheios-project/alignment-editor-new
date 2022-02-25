<template>
    <div class="alpheios-app-container">
      <span class="alpheios-alignment-app-menu-open-icon" @click = "menuShow++" v-if="identList.length > 1">
        <navbar-icon />
      </span>
      <main-menu 
        :menuShow = "menuShow"
        :fullData="fullData"
        @changeOrder = "changeOrder" @updateVisibility = "updateVisibility"
        @updateViewType = "updateViewType"
      />

        <div class="header alpheios-header">
            <div class="alpheios-header-logo">
                <img src="https://alignment.alpheios.net/images/alpheios-logo-only.png" class="alpheios-logo-1">
                <img src="https://alignment.alpheios.net/images/alpheios-logo-black.png" class="alpheios-logo-2">
            </div>
            <div class="alpheios-header-title">
                <h1>Alpheios Alignment Editor</h1>
                <div>
                  <tooltip tooltipText = "Help" tooltipDirection = "left">
                      <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-with-icon" id="alpheios-actions-menu-button__enter-help"
                          @click="$modal.show('help-block')" >
                          <span class="alpheios-alignment-button-icon">
                          <question-icon />
                          </span>
                      </button>
                  </tooltip>
                </div>
            </div>
        </div>

        <div id="alpheios-alignment-editor-container" class="alpheios-alignment-editor-container ">
            <text-filter-block :fullData="fullData" v-if="false"
                @changeOrder = "changeOrder" @updateVisibility = "updateVisibility" view = "horizontal" />

            <al-groups-view-full :fullData="fullData" :languageTargetIds = "languageTargetIds" v-if="viewType === 'viewFull'" />
            <al-groups-view-columns :fullData="fullData" :languageTargetIds = "languageTargetIds"  v-if="viewType === 'view3Columns'" />
            <al-groups-view-short :fullData="fullData" :languageTargetIds = "languageTargetIds"  v-if="viewType === 'viewShort'" />
            <al-groups-view-sentence :fullData="fullData" :languageTargetIds = "languageTargetIds"  :sentence-count = "sentenceCount" v-if="viewType === 'viewSentence'" />
            <al-groups-view-equivalence :fullData="fullData" :languageTargetIds = "languageTargetIds"  v-if="viewType === 'viewEquivalence'" />
            <al-groups-view-interlinearly :fullData="fullData" :languageTargetIds = "languageTargetIds"  v-if="viewType === 'viewInterlinearly'" />
        </div>
        <annotation-block />
        <help-popup @closeModal = "$modal.hide('help-block')" />
    </div>
</template>
<script>
import GroupUtility from '@/_output/utility/group-utility.js'
import SourceData from '@/_output/data/source-data.js'

import TextFilterBlock from '@/_output/vue/text-filter-block.vue'
import AnnotationBlock from '@/_output/vue/annotation-block.vue'

import AlGroupsViewFull from '@/_output/vue/views/al-groups-view-full.vue'
import AlGroupsViewShort from '@/_output/vue/views/al-groups-view-short.vue'
import AlGroupsViewSentence from '@/_output/vue/views/al-groups-view-sentence.vue'
import AlGroupsViewEquivalence from '@/_output/vue/views/al-groups-view-equivalence.vue'
import AlGroupsViewColumns from '@/_output/vue/views/al-groups-view-columns.vue'
import AlGroupsViewInterlinearly from '@/_output/vue/views/al-groups-view-interlinearly.vue'

import QuestionIcon from '@/_output/inline-icons/question.svg'
import Tooltip from '@/_output/vue/tooltip.vue'

import HelpPopup from '@/_output/vue/help-popup.vue'
import MainMenu from '@/_output/vue/main-menu.vue'

import NavbarIcon from '@/_output/inline-icons/navbar.svg'

export default {
  name: 'App',
  components: {
    textFilterBlock: TextFilterBlock,
    annotationBlock: AnnotationBlock,

    alGroupsViewFull: AlGroupsViewFull,
    alGroupsViewShort: AlGroupsViewShort,
    alGroupsViewSentence: AlGroupsViewSentence,
    alGroupsViewEquivalence: AlGroupsViewEquivalence,
    alGroupsViewColumns: AlGroupsViewColumns,
    alGroupsViewInterlinearly: AlGroupsViewInterlinearly,

    navbarIcon: NavbarIcon,
    questionIcon: QuestionIcon,
    tooltip: Tooltip,

    helpPopup: HelpPopup,
    mainMenu: MainMenu
  },
  data () {
    return {
      viewType: 'viewFull',
      sentenceCount: 0,
      identList: [],
      menuShow: 1
    }
  },
  created() {
    this.identList = GroupUtility.allIdentificationTargets(this.fullData)
  },
  computed: {
    fullData () {
      return new SourceData(this.$parent.fullData)
    },
    languageTargetIds () {
      return this.identList.filter(langData => !langData.hidden).map(langData => langData.targetId)
    }
  },
  methods: {

    changeOrder (langList) {
      this.identList.sort((a, b) => {
        return langList.indexOf(a.targetId) - langList.indexOf(b.targetId)
      })
    },

    updateVisibility (langData) {
      this.identList.find(curLangData => curLangData.targetId === langData.targetId).hidden = langData.hidden
    },

    updateViewType ({ viewType, sentenceCount }) {
      this.viewType = viewType
      this.sentenceCount = sentenceCount ? sentenceCount : 0
    }
  }
}
</script>
<style lang="scss">
    .alpheios-header-title {
      display: flex;
      justify-content: space-between;
    }
    .alpheios-alignment-editor-container {
        padding: 15px;
        height: calc(100% - 110px);
    }

    button.alpheios-actions-menu-button.alpheios-actions-menu-button-with-icon {
      padding: 5px;
      margin: 0 5px;
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
