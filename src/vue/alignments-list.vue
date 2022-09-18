<template>
  <div class="alpheios-alignment-editor-alignments" v-show="readyAlignments">

    <table class="alpheios-alignment-editor-alignments-table">
        <tr v-for="(alData, alIndex) in state.alignments" :key="alIndex">
          <td class="alpheios-alignment-editor-alignments-table_link alpheios-alignment-editor-alignments-table_dt" 
            @click="uploadAlignmentFromDB(alData)">
            {{ alData.updatedDT }}
          </td>
          <td class="alpheios-alignment-editor-alignments-table_link" @click="uploadAlignmentFromDB(alData)">
            {{ alData.title || alData.langsList }}
          </td>
          <td class="alpheios-alignment-editor-alignments-table_link alpheios-alignment-editor-alignments-table_has_tokens" @click="uploadAlignmentFromDB(alData)">
            {{ formatHasTokens(alData.hasTokens) }}
          </td>
          <td class="alpheios-alignment-editor-alignments-table_delete-icon" v-if="!menuVersion">
            <span :id="removeId(alData)" class="alpheios-alignment-editor-alignments-table_delete-icon_span" 
            @click="deleteAlignmentFromDB(alData)">
              <delete-icon />
            </span>
          </td>
        </tr>
    </table>

    <p class="alpheios-alignment-editor-alignments-clear-all" v-if="!menuVersion && state.alignments.length > 0">
      <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="clearAllAlignments">
          Clear Alignments</button>
    </p>
  </div>
</template>
<script setup>
import DeleteIcon from '@/inline-icons/delete.svg'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import { reactive, inject, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'

const $textC = inject('$textC')
const l10n = computed(() => { return L10nSingleton })
const $store = useStore()

const props = defineProps({
  menuVersion: {
    type: Boolean,
    required: false,
    default: false
  }
})

const state = reactive({ 
  alignments: []
})

onMounted(async () => {
  state.alignments = await $textC.uploadFromAllAlignmentsDB()
})
const emit = defineEmits([ 'upload-data-from-db', 'delete-data-from-db', 'clear-all-alignments' ])

const readyAlignments = computed(() => {
  return state.alignments && state.alignments.length > 0
})

const removeId = (alData) => {
  return `alpheios-delete-id-${alData.alignmentID}`
}

const uploadAlignmentFromDB = (alData) => {
  emit('upload-data-from-db', alData)
}

const deleteAlignmentFromDB = (alData) => {
  emit('delete-data-from-db', alData)
}

const clearAllAlignments = () => {
  emit('clear-all-alignments')
}

const formatHasTokens = (hasTokens) => {
  if (hasTokens === false) {
    return l10n.value.getMsgS('INITIAL_NO_TOKENS')
  } else if (hasTokens === true) {
    return l10n.value.getMsgS('INITIAL_HAS_TOKENS')
  } else {
    return ''
  }
}

watch( 
  () => $store.state.reloadAlignmentsList, 
  async () => {
    state.alignments = await $textC.uploadFromAllAlignmentsDB()
  }
)
</script>

<style lang="scss">
.alpheios-alignment-editor-alignments-table {
    td {
        text-align: left;
        padding: 5px;
        cursor: pointer;

        &.alpheios-alignment-editor-alignments-table_dt {
            min-width: 144px;
            text-decoration: underline; 
        }

        &.alpheios-alignment-editor-alignments-table_has_tokens {
            min-width: 80px;
        }

    }
}

.alpheios-alignment-editor-alignments-table_delete-icon_span {
  display: inline-block;
  width: 25px;
  height: 25px;

  cursor: pointer;
  svg {
    display: inline-block;
    width: 100%;
    height: 100%;
  }
}
</style>