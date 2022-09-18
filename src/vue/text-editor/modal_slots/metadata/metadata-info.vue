<template>
    <div class="alpheios-alignment-editor-metadata__info">
        <p class="alpheios-alignment-editor-metadata__info-title" @click = "state.showDetails=!state.showDetails">
            Instructions for metadata updates
        </p>
        <div class="alpheios-alignment-editor-metadata__info-details" v-show = "state.showDetails" v-html="instructions">
        </div>
    </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import { computed, inject, reactive, onMounted, watch, ref } from 'vue'

const l10n = computed(() => { return L10nSingleton })

const state = reactive({
  showDetails: false
})

const instructions = computed(() => {
  return `${l10n.value.getMsgS('METADATA_INSTRUCTIONS')} <p><a class="alpheios-alignment-editor-metadata__info-link" href="https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#section-3" target="_blank">read more</a></p>`
})
</script>
<style lang="scss">
    p.alpheios-alignment-editor-metadata__info-title {
        cursor: pointer;
        color: #90a959;
        text-decoration: underline;
        margin: 10px 0;
    }

    .alpheios-alignment-editor-metadata__info-details {
        border-bottom: 1px solid rgb(106, 159, 181);
        padding-bottom: 10px;

        p, ul {
            margin: 0;
        }
    }
</style>