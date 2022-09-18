<template>
    <span>
        <span class="alpheios-alignment-editor-text-blocks-single__icons alpheios-alignment-editor-text-blocks-single__metadata_icon_no_data" 
            v-show="isEmptyMetadata" @click="emit('showModalMetadata')">
            <tooltip :tooltipText="l10n.getMsgS('NO_METADATA_ICON')" tooltipDirection="top">
                <no-metadata-icon />
            </tooltip>
        </span>
        <span class="alpheios-alignment-editor-text-blocks-single__icons alpheios-alignment-editor-text-blocks-single__metadata_icon_has_data" 
            v-show="hasMetadata" @click="emit('showModalMetadata')">
            <tooltip :tooltipText="l10n.getMsgS('HAS_METADATA_ICON')" tooltipDirection="top">
                <has-metadata-icon />
            </tooltip>
        </span>
    </span>
</template>
<script setup>
import Tooltip from '@/vue/common/tooltip.vue'
import NoMetadataIcon from '@/inline-icons/no-metadata.svg'
import HasMetadataIcon from '@/inline-icons/has-metadata.svg'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits([ 'showModalMetadata' ])

const l10n = computed(() => { return L10nSingleton })
const $store = useStore()
const $textC = inject('$textC')

const props = defineProps({
  textType: {
    type: String,
    required: true
  },
  textId: {
    type: String,
    required: false
  }
})

const isEmptyMetadata = computed(() => {
  const docSource = $textC.getDocSource(props.textType, props.textId)
  return $store.state.docSourceUpdated && docSource && docSource.hasEmptyMetadata
})

const hasMetadata = computed(() => {
  const docSource = $textC.getDocSource(props.textType, props.textId)
  return $store.state.docSourceUpdated && docSource && !docSource.hasEmptyMetadata
})

</script>