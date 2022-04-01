<template>
    <div class="alpheios-app-container">

      <main-menu 
        :menuShow = "menuShow"
        :fullData="fullData"
        @changeOrder = "changeOrder" @updateVisibility = "updateVisibility"
        @updateViewType = "updateViewType"
        :onlyFilter = "true"
        :currentView = "viewType"
        :allViewTypes = "allViewTypes"
      />

        <div class="header alpheios-header">
            <div class="alpheios-header-logo">
                <img src="https://alignment.alpheios.net/images/alpheios-logo-only.png" class="alpheios-logo-1">
                <img src="https://alignment.alpheios.net/images/alpheios-logo-black.png" class="alpheios-logo-2">
            </div>
            <div class="alpheios-header-title">
                <h1>Alpheios Alignment Editor</h1>
            </div>
        </div>

        <div id="alpheios-alignment-editor-container" class="alpheios-alignment-editor-container ">
            <div class="alpheios-alignment-editor-container-top-line" >
              <span class="alpheios-alignment-app-menu-open-icon" @click = "menuShow++" v-if="this.identList['viewFull'].length > 1 || windowWidth < 900">
                <navbar-icon />
              </span>
              <select-views @updateViewType = "updateViewType" :inHeader = "true" :allViewTypes = "allViewTypes" />
              <div class="alpheios-alignment-editor-container-question-button">
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
            <p class="alpheios-alignment-editor-container__view-notice" v-html="noticeText"></p>
            <text-filter-block :fullData="fullData" v-if="false"
                @changeOrder = "changeOrder" @updateVisibility = "updateVisibility" view = "horizontal" />

            <al-groups-view-full :fullData="fullData" :identList = "identList[viewType]" v-if="viewType === 'viewFull'" />
            <al-groups-view-columns :fullData="fullData" :identList = "identList[viewType]"  v-if="viewType === 'view3Columns'" />
            <al-groups-view-short :fullData="fullData" :identList = "identList[viewType]"  v-if="viewType === 'viewShort'" />
            <al-groups-view-sentence :fullData="fullData" :identList = "identList[viewType]"  :sentence-count = "sentenceCount" v-if="viewType === 'viewSentence'" />
            <al-groups-view-equivalence :fullData="fullData" :identList = "identList[viewType]"  v-if="viewType === 'viewEquivalence'" />
            <al-groups-view-interlinearly :fullData="fullData" :identList = "identList[viewType]"  v-if="viewType === 'viewInterlinearly'" />
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
import SelectViews from '@/_output/vue/select-views.vue'

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
    mainMenu: MainMenu,
    selectViews: SelectViews
  },
  data () {
    return {
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
      ]
    }
  },
  created() {
    Object.keys(this.identList).forEach(viewType => {
      this.identList[viewType] = GroupUtility.allIdentificationTargets(this.fullData, viewType)
    })

    this.viewType = this.allViewTypes[0].value
  },
  computed: {
    fullData () {
      return new SourceData(this.$parent.fullData)
    },
    shownTabs () {
      return this.identList[this.viewType].filter(langData => !langData.hidden)
    },
    noticeText () {
      return `This view displays the first <b>${this.shownTabs.length}</b> of the translations <b>${this.identList[this.viewType].length}</b> available. The menu in the upper left lets you change the selection and their order.`
    }
  },
  methods: {
    changeOrder (data) {
      this.identList[data.view].sort((a, b) => {
        return data.identsList.indexOf(a.targetId) - data.identsList.indexOf(b.targetId)
      })
    },

    updateVisibility (data) {
      this.identList[data.view].find(curLangData => curLangData.targetId === data.identData.targetId).hidden = data.identData.hidden
    },

    updateViewType ({ viewType, sentenceCount }) {
      this.viewType = viewType
      this.sentenceCount = sentenceCount ? sentenceCount : 0
    }
  }
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
