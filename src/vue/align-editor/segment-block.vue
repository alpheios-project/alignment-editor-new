<template>
    <div class="alpheios-alignment-editor-align-text-segment" 
         :style="cssStyle"
         :class = "cssClass" 
         v-if = "isShownSeg"
          >
          <p class="alpheios-alignment-editor-align-text-segment-row" v-if="props.isFirst">
            <span class="alpheios-alignment-editor-align-text-segment-row__langname" >{{ segment.langName }}</span>
            
            <metadata-icons :text-type = "props.textType" :text-id = "segment.docSourceId" 
            @showModalMetadata = "$modal.show(modalNameMetadata)"/>
          </p>

          <p class="alpheios-alignment-editor-align-text-parts" v-if="allPartsKeys.length > 1">
            <span class="alpheios-alignment-editor-align-text-parts-link" 
                  :class = "{ 'alpheios-alignment-editor-align-text-parts-link-current': state.currentPartIndexes.includes(parseInt(partData.partNum)) }"
                  v-for = "partData in allPartsKeys" :key="partData.partNum"
                  :style = partBlockStyle(partData.len)
            >
                  {{ 1 }}
            </span>
          </p>

          <div class="alpheios-alignment-editor-align-text-segment-tokens" :id = "cssId" :style="cssStyleSeg" :dir = "direction" :lang = "lang" >
            <p class="alpheios-alignment-editor-align-text-single-link" v-if="showPrev">
              <span class="alpheios-alignment-editor-align-text-parts-link-text" @click="uploadPrevPart">previous</span>
            </p>

            <template v-for = "(token, tokenIndex) in allTokens">
              <token
                v-if ="token.word"
                :token = "token" :key = "token.idWord"
                @update-annotation = "updateAnnotation"
                @update-alignment-group = "updateAlignmentGroup"
                @add-hover-token = "addHoverToken"
                @remove-hover-token = "removeHoverToken"
                :selected = "$store.state.alignmentUpdated && selectedToken(token)"
                :grouped = "$store.state.alignmentUpdated && groupedToken(token)"
                :inActiveGroup = "$store.state.alignmentUpdated && inActiveGroup(token)"
                :firstInActiveGroup = "$store.state.alignmentUpdated && isFirstInActiveGroup(token)"
                :firstTextInActiveGroup = "$store.state.alignmentUpdated && isFirstTextInActiveGroup(token)"
                :annotationMode="annotationMode"
              />
              <br v-if="$store.state.tokenUpdated && token.hasLineBreak" />
            </template>
            
            <p class="alpheios-alignment-editor-align-text-single-link" v-if="showNext">
              <span class="alpheios-alignment-editor-align-text-parts-link-text" @click="uploadNextPart">next</span>  
            </p>
          </div>

          
        <metadata-block :modalName = "modalNameMetadata"
           :text-type = "props.textType" :text-id = "segment.docSourceId" v-if="props.isFirst" />
    </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import SettingsController from '@/lib/controllers/settings-controller.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import Token from '@/vue/align-editor/token-block.vue'
import ScrollUtility from '@/lib/utility/scroll-utility.js'
import Tooltip from '@/vue/common/tooltip.vue'

import MetadataBlock from '@/vue/text-editor/modal_slots/metadata/metadata-block.vue'
import MetadataIcons from '@/vue/common/metadata-icons.vue'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const l10n = computed(() => { return L10nSingleton })

const $store = useStore()
const $textC = inject('$textC')
const $alignedGC = inject('$alignedGC')

const $modal = inject('$modal')

const emit = defineEmits([ 'update-annotation' ])

const props = defineProps({
  currentTargetId: {
    type: String,
    required: false
  },

  segmentIndex: {
    type: Number,
    required: true
  },

  textType: {
    type: String,
    required: false
  },

  textId: {
    type: String,
    required: false
  },

  isLast : {
    type: Boolean,
    required: false,
    default: false
  },

  amountOfShownTabs: {
    type: Number,
    required: false,
    default: 1
  },

  isFirst: {
    type: Boolean,
    required: false,
    default: false
  },
  annotationMode: {
    type: Boolean,
    required: false,
    default: false
  },
  shownTabs: {
    type: Array,
    required: true
  }
})

const state = reactive({
  updated: 1,
  colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
  originColor: '#F8F8F8',
  heightStep: 20,
  heightDelta: 0,
  heightUpdated: 1,
  showUpDown: false,
  minMaxHeight: 500,
  showModalMetadata: false,
  currentPartIndexes: [ 1 ]
})


const segment = computed(() => {
  return $store.state.reuploadTextsParts && $textC.getSegment(props.textType, props.textId, props.segmentIndex)
})

const formattedTextId  = computed(() => props.textId ?? 'no-id' )
const formattedPrefix = computed(() => `${props.textType}-${formattedTextId.value}`)

const modalNameMetadata = computed(() => {
  return `metadata-${formattedPrefix.value}-${props.segmentIndex}`
})

const direction = computed(() => {
  return segment.value.direction
})

const lang = computed(() => {
  return $store.state.alignmentUpdated && segment.value.lang
})

const cssId = computed(() => {
  return getCssId(props.textType, props.textId, props.segmentIndex)
})

const backgroundStyle = computed(() => {
  return `background: ${state.originColor};`
})

const cssStyle = computed(() => {
  let result 
  if (props.textType === 'target') {
    result = `order: ${props.segmentIndex};`
  } else {
    result = `order: ${props.segmentIndex};`
  }
  return result
})

const cssStyleSeg = computed(() => {
  let result 
  if (props.textType === 'target') {
    result = `${backgroundStyle.value} max-height: ${maxHeight.value}px;`
  } else {
    result = `${backgroundStyle.value} max-height: ${maxHeight.value}px;`
  }
  return result
})

const cssClass = computed(() => {
  let classes = {}
  classes[`alpheios-align-text-segment-${props.textType}`] = true
  classes[`alpheios-align-text-segment-${props.textType}-last`] = props.isLast
  classes[`alpheios-align-text-segment-first`] = props.isFirst
  return classes
})

const allTargetTextsIds = computed(() => {
  return $store.state.alignmentUpdated ? $textC.allTargetTextsIds : []
})

const targetIdIndex = computed(() => {
  return props.textType === 'target' ? allTargetTextsIds.value.indexOf(props.textId) : null
})

const alignmentGroupsWorkflowAvailable = computed(() => {
  return $store.state.alignmentUpdated && $alignedGC.alignmentGroupsWorkflowAvailable
})

const allPartsKeys = computed(() => {
  return  $store.state.tokenUpdated && $store.state.reuploadTextsParts && segment.value.allPartNums ? segment.value.allPartNums : []
})

const allPartKeysLen = computed(() => {
  const sumArr = (total, partData) => total + partData.len
  return allPartsKeys.value.length > 1 ? allPartsKeys.value.reduce(sumArr, 0) : 0
})

const amountOfSegments = computed(() => {
  return $store.state.alignmentUpdated ? $alignedGC.getAmountOfSegments(segment.value) : 1
})

const containerHeight = computed(() => {
  return (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) - 350
})

const maxHeight = computed(() => {
  if (amountOfSegments.value === 1) {
    return containerHeight.value + state.heightDelta
  }
})

const isEmptyMetadata = computed(() => {
  const docSource = $textC.getDocSource(props.textType, segment.value.docSourceId)
  return $store.state.docSourceUpdated && docSource && docSource.hasEmptyMetadata
})

const hasMetadata = computed(() => {
  const docSource = $textC.getDocSource(props.textType, segment.value.docSourceId)
  return $store.state.docSourceUpdated && docSource && !docSource.hasEmptyMetadata
})

const allTokens = computed(() => {
  let result

  if (segment.value.allPartNums) {
    result = $textC.getSegmentPart(props.textType, segment.value.docSourceId, segment.value.index, state.currentPartIndexes)
  }

  return  $store.state.tokenUpdated && $store.state.uploadPartNum && $store.state.reuploadTextsParts ? result : []
})

const showPrev = computed(() => {
  return allPartsKeys.value.length > 0 && (Math.min(...state.currentPartIndexes) > allPartsKeys.value[0].partNum)
})

const showNext = computed(() => {
  return allPartsKeys.value.length > 0 && (Math.max(...state.currentPartIndexes) < allPartsKeys.value[allPartsKeys.value.length-1].partNum)
})

const isShownSeg = computed(() => {
  return props.textType === 'origin' || props.shownTabs.includes(props.textId)
})

const partBlockStyle = (len) => {
  const percentLen = Math.floor(len*100/allPartKeysLen.value)
  return `width: ${percentLen}%;`
}

const getCssId = (textType, targetId, segmentIndex) => {
  if (textType === 'target') {
    return `alpheios-align-text-segment-${textType}-${targetId}-${segmentIndex}`
  } else {
    return `alpheios-align-text-segment-${textType}-${segmentIndex}`
  }
}

const updateAlignmentGroup = (token) => {
  if (alignmentGroupsWorkflowAvailable.value && props.currentTargetId) {
    $alignedGC.clickToken(token, props.currentTargetId)
  } else if (!alignmentGroupsWorkflowAvailable.value) {
    console.error(L10nSingleton.getMsgS('ALIGN_EDITOR_CLICK_TOKEN_UNAVAILABLE'))
    NotificationSingleton.addNotification({
      text: L10nSingleton.getMsgS('ALIGN_EDITOR_CLICK_TOKEN_UNAVAILABLE'),
      type: NotificationSingleton.types.ERROR
    })
  }
}

const addHoverToken = (token) => {
  $alignedGC.activateHoverOnAlignmentGroups(token, props.currentTargetId)
  // this.makeScroll(token)
}

const makeScroll = (token) => {
  const scrollData = $alignedGC.getOpositeTokenTargetIdForScroll(token)
  if (scrollData.length > 0) {
    const textTypeSeg = (token.textType === 'target') ? 'origin' : 'target'
    
    for (let i = 0; i < scrollData.length; i++) {
      const segId = getCssId(textTypeSeg, scrollData[i].targetId, props.segmentIndex)
      const tokId = `token-${scrollData[i].minOpositeTokenId}`

      ScrollUtility.makeScrollTo(tokId, segId)
    }
  }
}

const removeHoverToken = () => {
  $alignedGC.clearHoverOnAlignmentGroups()
}

const selectedToken = (token) => {
  return $alignedGC.selectedToken(token, props.currentTargetId)
}

const groupedToken = (token) => {
  return $alignedGC.tokenIsGrouped(token, props.shownTabs)
}

const inActiveGroup = (token) => {
  return $alignedGC.tokenInActiveGroup(token, props.currentTargetId)
}

const isFirstInActiveGroup = (token) => {
  return $alignedGC.isFirstInActiveGroup(token, props.currentTargetId)
}

const isFirstTextInActiveGroup = (token) => {
  return $alignedGC.isFirstTextInActiveGroup(token, props.currentTargetId)
}

const uploadPrevPart = async () => {
  let partNums = []
  partNums.push(state.currentPartIndexes[0]-1)
  partNums.push(state.currentPartIndexes[0])
  await uploadPartByNum(partNums)
  state.currentPartIndexes = partNums
}

const uploadNextPart = async () => {
  let partNums = []
  partNums.push(state.currentPartIndexes[state.currentPartIndexes.length - 1])
  partNums.push(state.currentPartIndexes[state.currentPartIndexes.length - 1]+1)
  await uploadPartByNum(partNums)
  state.currentPartIndexes = partNums
}

const uploadPartByNum = async (partNums) => {
  await $textC.checkAndUploadSegmentsFromDB(props.textType, props.textId, props.segmentIndex, partNums)
}

const updateAnnotation = (token) => {
  emit('update-annotation', token)
}

const showModalMetadata = () => {
  
}
</script>

<style lang="scss">
.alpheios-alignment-editor-align-text-segment {
  // padding: 10px;
  // position: relative;
  .alpheios-alignment-editor-align-text-segment-tokens {
    padding: 10px;
    max-height: 400px;
    overflow-y: auto;
  }
}

.alpheios-align-text-segment-first {
  // padding-top: 40px;
}
  .alpheios-alignment-editor-align-text-segment-row {
      margin: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      // position: absolute;
      min-height: 2px;

      // overflow-y: hidden;
      border-bottom: 0;
      // top: 0;
      // right: 0;
      // left: 0;
      margin: 0;
      padding: 0;
      
      font-size: 90%;

      background: #eee;
      // color: #fff;
      // z-index: 100;

      .alpheios-alignment-editor-align-text-segment-row__langname {
        display: inline-block;
        padding: 5px 5px 0 15px;
        color: #000;
        font-weight: bold;
      }
    }
        span.alpheios-alignment-editor-text-blocks-single__icons {
          display: block;
          padding: 5px;

          svg {
            display: block;
            width: 25px;
            height: 25px;
            stroke: #99002a;
            fill: transparent;
          }
        }

        span.alpheios-alignment-editor-text-blocks-single__icons{

          &.alpheios-alignment-editor-text-blocks-single__metadata_icon_no_data {
            cursor: pointer;
            svg {
              stroke: #99002a;
            }
          }

          &.alpheios-alignment-editor-text-blocks-single__metadata_icon_has_data {
            cursor: pointer;
            svg {
              stroke: #2a9900;
            }
          }
        }
  .alpheios-alignment-editor-align-text-parts-link-text {
    cursor: pointer;
    display: inline-block;
    padding: 3px;
    text-decoration: underline;
  }

  .alpheios-alignment-editor-align-text-parts-link {
    // cursor: pointer;
    display: inline-block;
    vertical-align: middle;
    padding: 3px;
    // text-decoration: underline;
    font-size: 0;
    background: #c6c6c6;
    border: 1px solid #fff;
    min-width: 8px;

    &.alpheios-alignment-editor-align-text-parts-link-current {
      cursor: initial;
      // text-decoration: none;
      background: #6e6e6e;
    }
  }

  .alpheios-alignment-editor-align-text-parts,
  .alpheios-alignment-editor-align-text-single-link {
    margin: 0;
    text-align: center;
    color: #000;
    font-weight: bold;
  }

  .alpheios-alignment-editor-align-text-parts {
    padding: 0 25px;
  }
</style>
