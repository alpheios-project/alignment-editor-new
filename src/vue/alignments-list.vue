<template>
  <div class="alpheios-alignment-editor-alignments" v-show="readyAlignments">

    <table class="alpheios-alignment-editor-alignments-table">
        <tr v-for="(alData, alIndex) in alignments" :key="alIndex">
          <td class="alpheios-alignment-editor-alignments-table_link alpheios-alignment-editor-alignments-table_dt" @click="uploadAlignmentFromDB(alData)">{{ alData.updatedDT }}</td>
          <td class="alpheios-alignment-editor-alignments-table_link" @click="uploadAlignmentFromDB(alData)">{{ alData.langsList }}</td>
          <td class="alpheios-alignment-editor-alignments-table_delete-icon">
            <span :id="removeId(alData)" class="alpheios-alignment-editor-alignments-table_delete-icon_span" @click="deleteAlignmentFromDB(alData)">
              <delete-icon />
            </span>
          </td>
        </tr>
    </table>

    <p class="alpheios-alignment-editor-alignments-clear-all" v-if="alignments.length > 0">
      <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="clearAllAlignments">Clear Alignments</button>
    </p>
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import DeleteIcon from '@/inline-icons/delete.svg'

export default {
  name: 'AlignmentsList',
  components: {
    deleteIcon: DeleteIcon
  },
  props: {
  },
  data () {
    return {
      alignments: []
    }
  },
  watch: {
    async '$store.state.reloadAlignmentsList' () {
      await this.uploadAlignmentsFromDB()
    }
  },
  async mounted () {
    await this.uploadAlignmentsFromDB()
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    readyAlignments () {
      return this.alignments && this.alignments.length > 0
    }
  },
  methods: {
    async uploadAlignmentsFromDB () {
      this.alignments = await this.$textC.uploadFromAllAlignmentsDB()
    },
    removeId (alData) {
      return `alpheios-delete-id-${alData.alignmentID}`
    },
    uploadAlignmentFromDB (alData) {
      this.$emit('upload-data-from-db', alData)
    },
    deleteAlignmentFromDB (alData) {
      this.$emit('delete-data-from-db', alData)
    },
    clearAllAlignments () {
      this.$emit('clear-all-alignments')
    }
  }
}

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