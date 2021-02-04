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
        <div class="container-inner">
            <div class="alpheios-alignment-editor-container">
                <al-groups-view-full />
            </div>
            
        </div>
    </div>
</template>
<script>
import AlGroupsViewFull from '@/_output/vue/al-groups-view-full.vue'
export default {
  name: 'App',
  components: {
    alGroupsViewFull: AlGroupsViewFull
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-container {
        padding: 15px 15px 0;
    }
</style>
