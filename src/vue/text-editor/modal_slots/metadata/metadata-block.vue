<template>
  <modal-base :modalName="props.modalName"  :draggable="true" height="auto" :shiftY="0.2" >   
    <div class="alpheios-alignment-editor-modal-metadata" data-alpheios-ignore="all">
      <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click = "closeModal">
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
                v-for="(metaGroup, metaGroupIndex) in allMetadataGroupData" :key="constructKey(metaGroupIndex, 1)" 
                :class = "{ 'alpheios-alignment-editor-metadata__group__title_inactive': state.activeGroup !== metaGroup.key }" 
                @click = "changeActiveGroup(metaGroup)" >
              {{ metaGroup.label }}
            </div>
            <a class="alpheios-alignment-editor-metadata-group__label-help" target="_blank" 
                href = "https://www.dublincore.org/specifications/dublin-core/dcmi-terms/"
                v-show="state.activeGroup === 'dublin'"
            >?</a>
          </div>
          
          <metadata-info v-show="state.activeGroup === 'dublin'"/>
          <div class="alpheios-alignment-editor-metadata__group__items" 
              v-show = "state.activeGroup === metaGroup.key"
              v-for="(metaGroup, metaGroupIndex) in allMetadataGroupData" :key="constructKey(metaGroupIndex, 2)" >
            <metadata-term-block 
              v-for="metadataTerm in metaGroup.items" :key="metadataTerm.id"
              :text-type="textType" :text-id="textId" :metadata-term="metadataTerm" />
          </div>
        </div>
      </div>
    </div>
  </modal-base>
</template>
<script setup>
import MetadataTermBlock from '@/vue/text-editor/modal_slots/metadata/metadata-term-block.vue'
import MetadataInfo from '@/vue/text-editor/modal_slots/metadata/metadata-info.vue'
import XCloseIcon from '@/inline-icons/xclose.svg'

import OptionItemBlock from '@/vue/options/option-item-block.vue'

import Metadata from '@/lib/data/metadata.js'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()
const $textC = inject('$textC')
const $modal = inject('$modal')

const props = defineProps({
  textType: {
    type: String,
    required: true
  },
  textId: {
    type: String,
    required: false
  },
  modalName: {
    type: String,
    required: true
  }
})

const state = reactive({
  activeGroup: null
})

const closeModal = () => {
  $modal.hide(props.modalName)
}

const docSource = computed(() => {
  return $textC.getDocSource(props.textType, props.textId)
})

const allMetadata = computed(() => {
  return $store.state.docSourceUpdated && docSource.value && docSource.value.allAvailableMetadata
})

const commonMetadata = computed(() => {
  return allMetadata.value[Metadata.commonGroupLabel]
})

const allMetadataGroupData = computed(() => {
  if (!state.activeGroup) {
    state.activeGroup = Object.values(allMetadata.value)[0].key
  }

  let arrKeys = Object.keys(Metadata.groups).filter(groupName => groupName !== Metadata.commonGroupLabel)

  return arrKeys.map(groupLabel => allMetadata.value[groupLabel]) 
})

const constructKey = (metaGroupIndex, prefix) => {
  return `${prefix}-${metaGroupIndex}`
}

const changeActiveGroup = (metaGroup) => {
  state.activeGroup = metaGroup.key
}

</script>

<style lang="scss">
.alpheios-alignment-editor-modal-metadata {
  .alpheios-modal-body {
    // max-height: 700px;
    border: 0;
    padding: 10px;
    margin: 25px 0;
  }

  .alpheios-modal-header .alpheios-alignment-modal-close-icon {
    top: -35px;
  }
}


.alpheios-alignment-editor-metadata__group__titles {
  margin: 20px 0;
  .alpheios-alignment-editor-metadata__group__title {
    display: inline-block;
    cursor: pointer;

    
    background: #0e8319;
    color: #fff;
    border-radius: 5px;
    padding:10px;
    margin-right: 15px;

    &.alpheios-alignment-editor-metadata__group__title_inactive {
      background: #fff;
      color: #000;
    }
  }

  .alpheios-alignment-editor-metadata-group__label-help {
    display: inline-block;
    vertical-align: middle;
    width: 20px;
    height: 20px;
    background: #185F6D;
    color: #fff;
    border: 1px solid #185F6D;
    border-radius: 20px;
    text-align: center;
    line-height: 20px;
    margin-left: 5px;

    text-decoration: none;
  }
}

</style>
