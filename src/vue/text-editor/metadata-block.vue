<template>
    <div class="alpheios-alignment-editor-metadata" v-if="metadataAvailable">
      <metadata-info />
      <metadata-term-block 
        v-for="(metadataTerm, termIndex) in allMetadata" :key="termIndex"
        :text-type="textType" :text-id="textId" :metadata-term="metadataTerm" />
    </div>
</template>
<script>
import MetadataTermBlock from '@/vue/text-editor/metadata-term-block.vue'
import MetadataInfo from '@/vue/text-editor/metadata-info.vue'

export default {
  name: 'MetadataBlock',
  components: {
    metadataTermBlock: MetadataTermBlock,
    metadataInfo: MetadataInfo
  },
  props: {
    textType: {
      type: String,
      required: true
    },
    textId: {
      type: String,
      required: false
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
    metadataAvailable () {
      return this.$store.state.docSourceUpdated && Boolean(this.docSource)
    },
    allMetadata () {
      return this.$store.state.docSourceUpdated && this.metadataAvailable && this.docSource.allAvailableMetadata
    }
  },
  methods: {
  }
}
</script>

