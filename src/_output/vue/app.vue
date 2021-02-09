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
            </p>

            <al-groups-view-full :full-data="$parent.fullData" v-if="viewType === 'viewFull'" />
            <al-groups-view-short :full-data="$parent.fullData" v-if="viewType === 'viewShort'" />
        </div>
            
    </div>
</template>
<script>
import AlGroupsViewFull from '@/_output/vue/al-groups-view-full.vue'
import AlGroupsViewShort from '@/_output/vue/al-groups-view-short.vue'
export default {
  name: 'App',
  components: {
    alGroupsViewFull: AlGroupsViewFull,
    alGroupsViewShort: AlGroupsViewShort
  },
  data () {
    return {
      allViewTypes: [
        { value: 'viewFull', label: 'Full view'},
        { value: 'viewShort', label: 'Short view'}
      ],
      viewType: 'viewShort'
    }
  },
  methods: {
    itemIdWithValue (value) {
      return `alpheios-alignment-radio-block__${value.toLowerCase().replace(' ', '_')}`
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-container {
        padding: 15px 15px 0;
        height: calc(100% - 110px);
    }

    .alpheios-alignment-radio-block {
        margin: 0 10px;
        span {
            display: inline-block;
            margin-right: 20px;
        }
    }
</style>
