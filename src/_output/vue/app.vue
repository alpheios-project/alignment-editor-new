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
            <al-groups-view-full :full-data="$parent.fullData" v-if="0===1" />
            <al-groups-view-short :full-data="$parent.fullData"/>
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
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-container {
        padding: 15px 15px 0;
        height: calc(100% - 110px);
    }
</style>
