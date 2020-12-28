<template>
    <div class="alpheios-alignment-text-editor-metadata" v-if="metadataAvailable">
      <metadata-term-block 
        v-for="(metadataTerm, termIndex) in allMetadata" :key="termIndex"
        :text-type="textType" :text-id="textId" :metadata-term="metadataTerm" />
    </div>
</template>
<script>
import MetadataTermBlock from '@/vue/text-editor/metadata-term-block.vue'

export default {
  name: 'MetadataBlock',
  components: {
    metadataTermBlock: MetadataTermBlock
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
      return this.$store.state.alignmentUpdated && Boolean(this.docSource)
    },
    allMetadata () {
      return this.$store.state.alignmentUpdated && this.metadataAvailable && this.docSource.allAvailableMetadata
    }
  },
  methods: {
  }
}
</script>

