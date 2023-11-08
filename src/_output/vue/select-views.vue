<template>
    <div class = "alpheios-alignment-header-line" :class="{ 'alpheios-alignment-header-line-in-header' : inHeader }">
        <div class = "alpheios-alignment-radio-block alpheios-alignment-option-item__control">
            <span v-for="(item, idx) in allViewTypes" :key="idx">
              <input type="radio" :id="itemIdWithValue(item.value)" :value="item.value" v-model="viewType" 
                :ref = "itemIdWithValue(item.value)"
                :data-checked1="item.value"
                :data-checked2="viewType"
                @change="changeViewType"
              />
              <label :for="itemIdWithValue(item.value)" @click = "clickInput(item.value)"> {{ item.label }} </label>
            </span>
            <span>
            <select
                class="alpheios-alignment-select alpheios-alignment-select__sentence-count"
                v-model="sentenceCount" id="alpheios-alignment-select__sentence-count"
                @change="changeViewType"
                v-show="showSentenceChoice"
                >
              <option v-for="item in sentenceChoice" :key="item.value" :value = "item.value">{{ item.label }}</option>
            </select>
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
    },
    allViewTypes: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      sentenceCount: 0,
      viewType: null,
      sentenceChoice: [
        { value: 0, label: 'current' },
        { value: 1, label: 'one on each side' }
      ]
    }
  },
  created () {
    this.viewType = this.allViewTypes[0].value
  },
  computed: {
    showSentenceChoice () {
      return state.viewType === 'viewSentence'
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

    changeViewType () {
      this.$emit('updateViewType', { viewType: this.viewType, sentenceCount: this.sentenceCount })
    },

    clickInput (itemValue) {
      const refInput = this.itemIdWithValue(itemValue)

      if (!this.$refs[refInput][0].checked) {
        this.$refs[refInput][0].click()
      }
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-header-line {
    padding: 60px 0 10px;
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
      width: 50px;
    }
  }

  .alpheios-alignment-header-line-in-header {
    .alpheios-alignment-radio-block {
      text-align: right;
      span {
        display: inline-block;
        margin-right: 20px;
        margin-bottom: 5px;
        background: transparent;
        border-bottom: none;
        padding: 0;

        &:last-of-type {
          margin-right: 0;
        }
      }
    }
  }
</style>