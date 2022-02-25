<template>
    <div class = "alpheios-alignment-header-line">
        <div class = "alpheios-alignment-radio-block alpheios-alignment-option-item__control">
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
        </div>

    </div>
</template>
<script>
import Tooltip from '@/_output/vue/tooltip.vue'

export default {
  name: 'SelectViews',
  components: {
    tooltip: Tooltip
  },
  data () {
    return {
      allViewTypes: [
        { value: 'viewFull', label: 'Full'},
        { value: 'view3Columns', label: '3 columns'},
        { value: 'viewShort', label: 'Short'},
        { value: 'viewEquivalence', label: 'Equivalence'},
        { value: 'viewInterlinearly', label: 'Interlinear'},
        { value: 'viewSentence', label: 'Sentence'}
      ],
      sentenceCount: 0,
      viewType: 'viewFull'
    }
  },
  watch: {
    viewType () {
      this.$emit('updateViewType', { viewType: this.viewType, sentenceCount: this.sentenceCount })
    },
    sentenceCount () {
      this.$emit('updateViewType', { viewType: this.viewType, sentenceCount: this.sentenceCount })
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
    }
  }
}
</script>