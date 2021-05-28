<template>
  <div class="alpheios-alignment-editor-alignments" v-show="readyAlignments">
      <table class="alpheios-alignment-editor-alignments-table">
          <tr v-for="(alData, alIndex) in alignments" :key="alIndex">
            <td class="alpheios-alignment-editor-alignments-table_link alpheios-alignment-editor-alignments-table_dt" @click="uploadAlignmentFromDB(alData)">{{ alData.updatedDT }}</td>
            <td class="alpheios-alignment-editor-alignments-table_link" @click="uploadAlignmentFromDB(alData)">{{ alData.langsList }}</td>
          </tr>
      </table>
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'AlignmentsList',
  props: {
  },
  data () {
    return {
      alignments: []
    }
  },
  async mounted () {
    this.alignments = await this.$textC.uploadFromAllAlignmentsDB()
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
    uploadAlignmentFromDB (alData) {
      this.$emit('upload-data-from-db', alData)
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
</style>