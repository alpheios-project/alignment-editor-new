<template>
    <div class="alpheios-alignment-editor-metadata__info">
        <p class="alpheios-alignment-editor-metadata__info-title" @click = "showDetails=!showDetails">
            Instructions for metadata updates
        </p>
        <div class="alpheios-alignment-editor-metadata__info-details" v-show = "showDetails" v-html="instructions">
        </div>
        
    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'MetadataInfo',
  data () {
    return {
      showDetails: false
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    instructions () {
      return `${this.l10n.getMsgS('METADATA_INSTRUCTIONS')} <p><a class="alpheios-alignment-editor-metadata__info-link" href="https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#section-3" target="_blank">read more</a></p>`
    }
  }
}
</script>
<style lang="scss">
    p.alpheios-alignment-editor-metadata__info-title {
        cursor: pointer;
        color: #90a959;
        text-decoration: underline;
        margin: 10px 0;
    }

    a.alpheios-alignment-editor-metadata__info-link {
      color: #90a959;
    }

    .alpheios-alignment-editor-metadata__info-details {
        border-bottom: 1px solid rgb(106, 159, 181);
        padding-bottom: 10px;

        p, ul {
            margin: 0;
        }
    }
</style>