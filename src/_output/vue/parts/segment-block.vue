<template>
      <div class = "alpheios-al-editor-segment-block-text" 
          :class = "cssClass"
          :id = "cssId" :style="cssStyle"
          :dir = "props.dir" :lang = "props.lang"
      >
        <lang-name-bar :langName = "props.langName" v-show="props.showLangName" 
                       :metadataShort = "props.metadataShort" @updateMetadataHeight = "updateMetadataHeight"
                       :showData = "showDataLangNameBar"
        />

          <template v-for = "(token, tokenIndex) in props.segmentData.tokens" :key = "tokenIndex">
              <token-block  :token="token" 
                              :selected = "selectedToken(token)"
                              :grouped = "groupedToken(token)"
                              @addHoverToken = "$emit('addHoverToken', token)"
                              @removeHoverToken = "$emit('removeHoverToken', token)"
                              :interlinearly = "props.interlinearly"
                              :shownTabs = "props.shownTabs"
              />
              <br v-if="token.hasLineBreak" />
          </template>
      </div>

</template>
<script setup>
import TokenBlock from '@/_output/vue/parts/token-block.vue'
import LangNameBar from '@/_output/vue/common/lang-name-bar.vue'

import { computed, reactive, inject, onMounted, watch } from 'vue'

const props = defineProps({
  // origin or target
  textType: {
    type: String,
    required: true
  },
  // segment data { tokens: [ { textType, idWord, word, sentenceIndex, grouped } ] }
  segmentData: {
    type: Object,
    required: true
  },
  // segment index
  segIndex: {
    type: Number,
    required: true
  },
  // max-height for segment cell div
  maxHeight: {
    type: Number,
    required: false
  },
  // direction - used for HTML markup
  dir: {
    type: String,
    required: true
  },
  // language - used for HTML markup - ISO 3 chars
  lang: {
    type: String,
    required: true
  },
  // language name - full language name - used for lang bar
  langName: {
    type: String,
    required: true
  },
  // metadata in one string to show in lang bar
  metadataShort: {
    type: String,
    required: false,
    defult: ''
  },
  // visible tabs array
  shownTabs: {
    type: Array,
    required: false,
    default: () => { return [] }
  },
  // array of alignmentGroupsId that are highlighted on token hover
  hoveredGroupsId: {
    type: Array,
    required: false,
    default: () => { return [] }
  },
  // flag if languge name should be rendered in lang bar
  showLangName: {
    type: Boolean,
    required: false,
    default: true
  },
  // index of targetId - used for color definition
  targetIdIndex: {
    type: Number,
    required: false,
    default: 0
  },
  // check if this segment is last - used for css border-bottom
  isLast: {
    type: Boolean,
    required: false,
    default: false
  },
  // there are two types of background - byTargetId - colors differ by targetId, bySegment - differs by segment (used for columns)
  changeColor: {
    type: String,
    required: false,
    default: 'byTargetId'
  },
  targetId: {
    type: String,
    required: false,
    default: 'byTargetId'
  },
  interlinearly: {
    type: Boolean,
    required: false,
    default: false
  }
})

const state = reactive({
  colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
  paddingTop: null
})

const cssId = computed(() => {
  return `alpheios-align-text-segment-${props.textType}-${props.segIndex}-${props.targetId}`
})

const cssStyle = computed(() => {
  const colors = props.changeColor === 'byTargetId' ? `background: ${state.colors[props.targetIdIndex]};` : `background: transparent;`
  let styles = `order: ${props.segIndex}; ${colors}`

  if (props.maxHeight) {
    styles = `${styles} max-height: ${props.maxHeight}px;`
  }
  if (state.paddingTop) {
    styles = `${styles} padding-top: ${state.paddingTop}px;`
  }
  return styles
})

/**
 * Show data inside lang bar only for the first segment
 */
const showDataLangNameBar = computed(() => {
  return props.segIndex === 0
})

const cssClass = computed(() => {
  return {
    'alpheios-al-editor-segment-block-text__no-langname': !props.showLangName,
    [`alpheios-align-text-segment-${props.textType}-${props.segIndex}`]: true,
    [`alpheios-al-editor-segment-cell-${props.textType}-row`]: true,
    [`alpheios-align-text-segment-${props.textType}`]: true,
    [`alpheios-align-text-segment-${props.textType}-last`]: props.isLast
  }
})

/**
 * Checks if translation with targetId is visible on the screen
 */
const isShownTab = (targetId) => {
  return props.shownTabs.length === 0 || props.shownTabs.includes(targetId)
}

/**
 * Checks if the token is grouped and visible on the screen
 */
const groupedToken = (token) => {
  return token.grouped && ((props.shownTabs.length === 0) || token.groupData.some(groupdataItem => isShownTab(groupdataItem.targetId)))
}

const isTokenInHoveredGroups = (token) => {
  return token.groupData.some(groupDataItem => props.hoveredGroupsId.includes(groupDataItem.groupId) ) 
}

/**
 * Checks if token is grouped and selected
 */
const selectedToken = (token) => {
  return props.hoveredGroupsId && (props.hoveredGroupsId.length > 0) && groupedToken(token) && isTokenInHoveredGroups(token)
}

const updateMetadataHeight = (height) => {
  state.paddingTop = height
}

</script>

<style lang="scss">
  .alpheios-al-editor-segment-cell-origin-row {
    position: relative;
    padding: 10px 5px;
    overflow-y: auto;

    &.alpheios-align-text-segment-origin-0 {
      padding-top: 30px;
    }

    &.alpheios-al-editor-segment-block-text__no-langname {
      padding: 10px;
    }

    .alpheios-al-editor-segment-block-text__langname {
      position: absolute;
      overflow-y: hidden;
      border-bottom: 0;
      top: 0;
      right: 0;
      left: 0;
      margin: 0;
      padding: 0;
      text-align: right;
      padding: 5px;
      font-size: 90%;

      background: #185F6D;
      color: #fff;
      z-index: 100;
    }
  }

  .alpheios-al-editor-segment-cell-target-row {
    &.alpheios-align-text-segment-target-0.alpheios-al-editor-segment-cell-target-row {
      padding-top: 30px;
    }
  }
</style>