<template>
  <modal :classes="classes" :name="mname"  :draggable="true" height="auto">
    <div class="alpheios-modal-header" >
        <span class="alpheios-alignment-modal-close-icon" @click = "$emit('closeModal')">
            <x-close-icon />
        </span>
    </div>
    <div class="alpheios-modal-body" v-if="allMetadata">
      <div class="alpheios-alignment-editor-metadata" >
        <metadata-info />
        <metadata-term-block 
          v-for="(metadataTerm, termIndex) in allMetadata" :key="termIndex"
          :text-type="textType" :text-id="textId" :metadata-term="metadataTerm" />
      </div>
    </div>
  </modal>
</template>
<script>
import MetadataTermBlock from '@/vue/text-editor/metadata-term-block.vue'
import MetadataInfo from '@/vue/text-editor/metadata-info.vue'
import XCloseIcon from '@/inline-icons/x-close.svg'

import OptionItemBlock from '@/vue/options/option-item-block.vue'

export default {
  name: 'MetadataBlock',
  components: {
    optionItemBlock: OptionItemBlock,

    metadataTermBlock: MetadataTermBlock,
    metadataInfo: MetadataInfo,
    xCloseIcon: XCloseIcon
  },
  props: {
    mname: {
      type: String,
      required: true
    },
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
    allMetadata () {
      return this.$store.state.docSourceUpdated && this.docSource && this.docSource.allAvailableMetadata
    },
    classes () {
      return `alpheios-alignment-editor-modal-metadata alpheios-alignment-editor-modal-${this.mname}`
    }
  },
  methods: {
  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-metadata {
  .alpheios-modal-body {
    // max-height: 700px;
    border: 0;
  }
}
</style>
