<template>
    <span>
        <span class="alpheios-alignment-editor-text-blocks-single__icons alpheios-alignment-editor-text-blocks-single__metadata_icon_no_data" 
            v-show="isEmptyMetadata" @click="$emit('showModalMetadata')">
            <tooltip :tooltipText="l10n.getMsgS('NO_METADATA_ICON')" tooltipDirection="top">
                <no-metadata-icon />
            </tooltip>
        </span>
        <span class="alpheios-alignment-editor-text-blocks-single__icons alpheios-alignment-editor-text-blocks-single__metadata_icon_has_data" 
            v-show="hasMetadata" @click="$emit('showModalMetadata')">
            <tooltip :tooltipText="l10n.getMsgS('HAS_METADATA_ICON')" tooltipDirection="top">
                <has-metadata-icon />
            </tooltip>
        </span>
    </span>
</template>
<script>
import Tooltip from '@/vue/common/tooltip.vue'
import NoMetadataIcon from '@/inline-icons/no-metadata.svg'
import HasMetadataIcon from '@/inline-icons/has-metadata.svg'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'MetadataIcons',
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
  components: {
    noMetadataIcon: NoMetadataIcon,
    hasMetadataIcon: HasMetadataIcon,
    tooltip: Tooltip
  },
  data () {
    return {}
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    isEmptyMetadata () {
      const docSource = this.$textC.getDocSource(this.textType, this.textId)
      return this.$store.state.docSourceUpdated && docSource && docSource.hasEmptyMetadata
    },

    hasMetadata () {
      const docSource = this.$textC.getDocSource(this.textType, this.textId)
      return this.$store.state.docSourceUpdated && docSource && !docSource.hasEmptyMetadata
    },
  }
}
</script>