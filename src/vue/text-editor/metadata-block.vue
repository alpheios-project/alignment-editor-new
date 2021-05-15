<template>
  <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-metadata">
    <template v-slot:body >
      <div class="alpheios-alignment-editor-metadata" >
        <metadata-info />
        <metadata-term-block 
          v-for="(metadataTerm, termIndex) in allMetadata" :key="termIndex"
          :text-type="textType" :text-id="textId" :metadata-term="metadataTerm" />
      </div>
    </template>
  </modal>
</template>
<script>
import MetadataTermBlock from '@/vue/text-editor/metadata-term-block.vue'
import MetadataInfo from '@/vue/text-editor/metadata-info.vue'
import Modal from '@/vue/common/modal.vue'

export default {
  name: 'MetadataBlock',
  components: {
    metadataTermBlock: MetadataTermBlock,
    metadataInfo: MetadataInfo,
    modal: Modal
  },
  props: {
    textType: {
      type: String,
      required: true
    },
    textId: {
      type: String,
      required: false
    },
    showModal: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
    }
  },
  computed: {
    itemId () {
      return `${this.textType}-${this.textId}-${this.metadataTerm.label}-id`
    },
    docSource () {
      return this.$textC.getDocSource(this.textType, this.textId)
    },
    allMetadata () {
      return this.$store.state.docSourceUpdated && this.docSource.allAvailableMetadata
    }
  },
  methods: {
  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-metadata {
  .alpheios-modal-body {
    max-height: 700px;
    border: 0;
  }
}
</style>
