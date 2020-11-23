<template>
    <p class = "alpheios-alignment-radio-block-container" :class="blockClassName">
        <span>{{ mainLabel }}  </span>
        <span v-for="prop in properties" :key="prop">
            <input type="radio" :id="radioId(prop)" :value="prop" v-model="selected" tabindex="1"
                   @change="updateData" :disabled="disabled" >
            <label :for="radioId(prop)">{{ propLabel(prop) }}</label>
        </span>
    </p>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'RadioItems',
  props: {
    itemName: {
      type: String,
      required: true
    },
    properties: {
      type: Array,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    idPrefix: {
      type: String,
      required: false,
      default: 'alpheios-alignment-radio-block-item__'
    }
  },
  data () {
    return {
      selected: null
    }
  },
  mounted () {
    this.selected = this.properties[0]
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    blockClassName () {
      return `alpheios-alignment-radio-block__${this.itemName}`
    },
    mainLabel () {
      return this.l10n.getMsgS(`RADIO_BLOCK_${this.itemName.toUpperCase()}_LABEL`)
    }
  },
  methods: {
    radioId (prop) {
      return `${this.idPrefix}__${prop}`
    },
    propLabel (prop) {
      return this.l10n.getMsgS(`RADIO_BLOCK_${this.itemName.toUpperCase()}_${prop.toUpperCase()}`)
    },
    updateData () {
      this.$emit('updateData', this.selected)
    }
  }
}
</script>
<style lang="scss">
.alpheios-alignment-radio-block-container {
  margin-top: 0;
}
</style>