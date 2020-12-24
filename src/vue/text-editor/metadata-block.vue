<template>
    <div class="alpheios-alignment-text-editor-single-metadata" v-if="metadataAvailable">
        {{ allMetadata }}
    </div>
</template>
<script>
export default {
  name: 'MetadataBlock',
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
    metadataAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && Boolean(this.$textC.getDocSource(this.textType, this.textId))
    },
    allMetadata () {
      console.info('allAvailableMetadata - ', this.$textC.getDocSource(this.textType, this.textId).allAvailableMetadata)
      return this.$store.state.alignmentUpdated && this.$textC.getDocSource(this.textType, this.textId).allAvailableMetadata
    }
  }
}
</script>
