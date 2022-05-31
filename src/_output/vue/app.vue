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
                <img :src="alpheiosLogoOnlyPNG" class="alpheios-logo-1">
                <img :src="alpheiosLogoBlackPNG" class="alpheios-logo-2">
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
      ],

      alpheiosLogoOnlyPNG: 'data:image/png;base64,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',
      alpheiosLogoBlackPNG: 'data:image/png;base64,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'
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
