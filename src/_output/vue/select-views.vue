<template>
    <div class = "alpheios-alignment-header-line" :class="{ 'alpheios-alignment-header-line-in-header' : inHeader }">
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
  props: {
    inHeader: {
      type: Boolean,
      required: false,
      default: true
    }
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
<style lang="scss">
  .alpheios-alignment-header-line {
    padding: 60px 20px 10px;
    &.alpheios-alignment-header-line-in-header {
      padding-top: 0;
    }
  }

  .alpheios-alignment-radio-block {
    // margin: 0 10px 10px;
    span {
        display: block;
        // margin-right: 20px;
        // margin-bottom: 5px;
        background: #fff;
        border-bottom: 1px solid #e0e0e0;
        padding: 5px;
    }

    input.alpheios-alignment-input__sentence-count {
      width: 70px;
    }
  }

  .alpheios-alignment-header-line-in-header {
    .alpheios-alignment-radio-block {
      
      span {
        display: inline-block;
        margin-right: 20px;
        margin-bottom: 5px;
        background: transparent;
        border-bottom: none;
        padding: 0;
      }
    }
  }
</style>