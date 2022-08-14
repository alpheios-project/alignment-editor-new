<template>
  <modal :classes="classes" :name="mname"  :draggable="true" height="auto" data-alpheios-ignore="all" :shiftY="0.2">
    <div class="alpheios-modal-header" >
        <span class="alpheios-alignment-modal-close-icon" @click = "$emit('closeModal')">
            <x-close-icon />
        </span>
    </div>
    <div class="alpheios-modal-body" v-if="allMetadata">
      <div class="alpheios-alignment-editor-metadata" >
        <div class="alpheios-alignment-editor-metadata__group__common" >
          <metadata-term-block 
            v-for="metadataTerm in commonMetadata.items" :key="metadataTerm.id"
            :text-type="textType" :text-id="textId" :metadata-term="metadataTerm" />
        </div>
        <div class="alpheios-alignment-editor-metadata__group__titles" >
          <div class = "alpheios-alignment-editor-metadata__group__title" 
               :class = "{ 'alpheios-alignment-editor-metadata__group__title_inactive': activeGroup !== metaGroup.key }" 
               @click = "changeActiveGroup(metaGroup)"
               v-for="(metaGroup, metaGroupIndex) in allMetadataGroupData" :key="constructKey(metaGroupIndex, 1)" >
            {{ metaGroup.label }}
          </div>
        </div>
        
        <metadata-info v-show="activeGroup === 'dublin'"/>
        <div class="alpheios-alignment-editor-metadata__group__items" 
             v-show = "activeGroup === metaGroup.key"
             v-for="(metaGroup, metaGroupIndex) in allMetadataGroupData" :key="constructKey(metaGroupIndex, 2)" >
          <metadata-term-block 
            v-for="metadataTerm in metaGroup.items" :key="metadataTerm.id"
            :text-type="textType" :text-id="textId" :metadata-term="metadataTerm" />
        </div>
      </div>
    </div>
  </modal>
</template>
<script>
import MetadataTermBlock from '@/vue/text-editor/metadata-term-block.vue'
import MetadataInfo from '@/vue/text-editor/metadata-info.vue'
import XCloseIcon from '@/inline-icons/x-close.svg'

import OptionItemBlock from '@/vue/options/option-item-block.vue'

import Metadata from '@/lib/data/metadata.js'

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
      activeGroup: null
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
    commonMetadata () {
      return this.allMetadata[Metadata.commonGroupLabel]
    },
    allMetadataGroupData () {
      if (!this.activeGroup) {
        this.activeGroup = Object.values(this.allMetadata)[0].key
      }

      let arrKeys = Object.keys(Metadata.groups).filter(groupName => groupName !== Metadata.commonGroupLabel)

      const res = arrKeys.map(groupLabel => this.allMetadata[groupLabel]) 
      return res
    },
    classes () {
      return `alpheios-alignment-editor-modal-metadata alpheios-alignment-editor-modal-${this.mname}`
    }
  },
  methods: {
    constructKey (metaGroupIndex, prefix) {
      return `${prefix}-${metaGroupIndex}`
    },
    changeActiveGroup (metaGroup) {
      this.activeGroup = metaGroup.key
    }
  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-metadata {
  .alpheios-modal-body {
    // max-height: 700px;
    border: 0;
    padding: 10px;
  }
}

.alpheios-alignment-editor-metadata__group__titles {
  margin: 20px 0;
  .alpheios-alignment-editor-metadata__group__title {
    display: inline-block;
    cursor: pointer;

    
    background: #90a959;
    color: #fff;
    border-radius: 5px;
    padding:10px;
    margin-right: 15px;

    &.alpheios-alignment-editor-metadata__group__title_inactive {
      background: #000;
    }
  }
}

</style>
