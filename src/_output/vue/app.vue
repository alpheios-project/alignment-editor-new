<template>
    <div class="alpheios-app-container">
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
            <p class = "alpheios-alignment-radio-block alpheios-alignment-option-item__control">
                <span v-for="item in allViewTypes" :key="item.value">
                    <input type="radio" :id="itemIdWithValue(item.value)" :value="item.value" v-model="viewType"
                    >
                    <label :for="itemIdWithValue(item.value)">{{ item.label }}</label>
                </span>
                <span>
                  <input
                      class="alpheios-alignment-input alpheios-alignment-input__sentence-count"
                      type="number" min="0"
                      v-model.number="sentenceCount"
                      @change="checkSentenceCount"
                      :id="itemIdWithValue('sentenceCount')"
                  >
                  <label :for="itemIdWithValue('sentenceCount')" >sentences around</label>
                </span>
            </p>

            <languages-block :fullData="fullData" v-if="languagesList.length > 1"
                @changeLanguageOrder = "changeLanguageOrder" @updateVisibility = "updateVisibility"/>

            <al-groups-view-full :fullData="fullData" :languageTargetIds = "languageTargetIds" v-if="viewType === 'viewFull'" />
            <al-groups-view-columns :fullData="fullData" :languageTargetIds = "languageTargetIds"  v-if="viewType === 'view3Columns'" />
            <al-groups-view-short :fullData="fullData" :languageTargetIds = "languageTargetIds"  v-if="viewType === 'viewShort'" />
            <al-groups-view-sentence :fullData="fullData" :languageTargetIds = "languageTargetIds"  :sentence-count = "sentenceCount" v-if="viewType === 'viewSentence'" />
            <al-groups-view-equivalence :fullData="fullData" :languageTargetIds = "languageTargetIds"  v-if="viewType === 'viewEquivalence'" />
            <al-groups-view-interlinearly :fullData="fullData" :languageTargetIds = "languageTargetIds"  v-if="viewType === 'viewInterlinearly'" />
        </div>
        <annotation-block />
    </div>
</template>
<script>
import GroupUtility from '@/_output/utility/group-utility.js'
import SourceData from '@/_output/data/source-data.js'

import LanguagesBlock from '@/_output/vue/languages-block.vue'
import AnnotationBlock from '@/_output/vue/annotation-block.vue'

import AlGroupsViewFull from '@/_output/vue/views/al-groups-view-full.vue'
import AlGroupsViewShort from '@/_output/vue/views/al-groups-view-short.vue'
import AlGroupsViewSentence from '@/_output/vue/views/al-groups-view-sentence.vue'
import AlGroupsViewEquivalence from '@/_output/vue/views/al-groups-view-equivalence.vue'
import AlGroupsViewColumns from '@/_output/vue/views/al-groups-view-columns.vue'
import AlGroupsViewInterlinearly from '@/_output/vue/views/al-groups-view-interlinearly.vue'

export default {
  name: 'App',
  components: {
    languagesBlock: LanguagesBlock,
    annotationBlock: AnnotationBlock,

    alGroupsViewFull: AlGroupsViewFull,
    alGroupsViewShort: AlGroupsViewShort,
    alGroupsViewSentence: AlGroupsViewSentence,
    alGroupsViewEquivalence: AlGroupsViewEquivalence,
    alGroupsViewColumns: AlGroupsViewColumns,
    alGroupsViewInterlinearly: AlGroupsViewInterlinearly
  },
  data () {
    return {
      allViewTypes: [
        { value: 'viewFull', label: 'Full'},
        { value: 'view3Columns', label: '3 columns'},
        { value: 'viewShort', label: 'Short'},
        { value: 'viewEquivalence', label: 'Equivalence'},
        { value: 'viewSentence', label: 'Sentence'},
        { value: 'viewInterlinearly', label: 'Interlinearly'}
      ],
      viewType: 'viewInterlinearly',
      sentenceCount: 0,
      languagesList: []
    }
  },
  created() {
    this.languagesList = GroupUtility.allLanguagesTargets(this.fullData)
  },
  computed: {
    fullData () {
      return new SourceData(this.$parent.fullData)
    },
    languageTargetIds () {
      return this.languagesList.filter(langData => !langData.hidden).map(langData => langData.targetId)
    }
  },
  methods: {
    /**
     * Css id for display view select
     * @param {String} value - display view
     * @returns {String}
     */
    itemIdWithValue (value) {
      return `alpheios-alignment-radio-block__${value.toLowerCase().replace(' ', '_')}`
    },

    /**
     * Sets a limit for the sentence count typed manually - min 0
     */
    checkSentenceCount () {
      if (this.sentenceCount < 0) { 
        this.sentenceCount = 0
      }
    },

    changeLanguageOrder (langList) {
      this.languagesList.sort((a, b) => {
        return langList.indexOf(a.targetId) - langList.indexOf(b.targetId)
      })
    },

    updateVisibility (langData) {
      this.languagesList.find(curLangData => curLangData.lang === langData.lang).hidden = langData.hidden
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-container {
        padding: 15px;
        height: calc(100% - 110px);
    }

    .alpheios-alignment-radio-block {
        margin: 0 10px 10px;
        span {
            display: inline-block;
            margin-right: 20px;
        }

        input.alpheios-alignment-input__sentence-count {
          width: 100px;
        }
    }
</style>
