<template>
    <div class="alpheios-alignment-editor-align-text-segment-edit" :ref="el => (segref = el)">
          <p class="alpheios-alignment-editor-align-text-parts" v-if="allPartsKeys.length > 1">
            <span class="alpheios-alignment-editor-align-text-parts-link" 
                  :class = "{ 'alpheios-alignment-editor-align-text-parts-link-current': currentPartIndexes.includes(parseInt(partData.partNum)) }"
                  v-for = "partData in allPartsKeys" :key="partData.partNum"
                  :style = partBlockStyle(partData.len)
            >
                  {{ 1 }}
            </span>
          </p>

        <edit-buttons-block 
            :token = "state.actionsToken" v-show="state.showActionsMenuFlag"
            :leftPos = "state.actionsMenuLeft" :topPos = "state.actionsMenuTop"
            :containerWidth = "state.containerWidth"

            @updateTokenWord = "updateTokenWord"
            @mergeToken = "mergeToken"
            @splitToken = "splitToken"
            @addLineBreak = "addLineBreak"
            @removeLineBreak = "removeLineBreak"
            @moveToNextSegment = "moveToNextSegment"
            @moveToPrevSegment = "moveToPrevSegment"
            @deleteToken = "deleteToken"
            @insertTokens = "insertTokens"
        />

      <div class="alpheios-alignment-editor-align-text-segment-tokens" :id = "cssId" :dir = "direction" :lang = "lang" >

          <template v-for = "(token, tokenIndex) in allTokens">
            <token-edit-block
              v-if ="token.word"
              :token = "token" :key = "token.idWord" :deactivated = "state.deactivated"
              :updateTokenIdWord = "state.updateTokenIdWord === token.idWord ? state.updateTokenIdWord : null"
              :mergeTokenPrevIdWord = "state.mergeTokenPrevIdWord === token.idWord ? state.mergeTokenPrevIdWord : null"
              :mergeTokenNextIdWord = "state.mergeTokenNextIdWord === token.idWord ? state.mergeTokenNextIdWord : null"
              :splitTokenIdWord = "state.splitTokenIdWord === token.idWord ? state.splitTokenIdWord : null"
              :addLineBreakIdWord = "state.addLineBreakIdWord === token.idWord ? state.addLineBreakIdWord : null"
              :removeLineBreakIdWord = "state.removeLineBreakIdWord === token.idWord ? state.removeLineBreakIdWord : null"

              @hideActionsMenu = "hideActionsMenu" 
              @showActionsMenu = "showActionsMenu"
              @removeAllActivated = "removeAllActivatedEvent"

            />
            <br v-if="$store.state.tokenUpdated && token.hasLineBreak" />
          </template>

        </div>
    </div>
</template>
<script setup>
import TokenEditBlock from '@/vue/tokens-editor/token-edit-block.vue'
import EditButtonsBlock from '@/vue/tokens-editor/actions-menu/edit-buttons-block.vue'

import HistoryStep from '@/lib/data/history/history-step.js'
// import EmptyTokensInput from '@/vue/tokens-editor/empty-tokens-input.vue'

import { computed, inject, reactive, onMounted, watch, ref, nextTick } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits([ 'removeAllActivated', 'insertTokens' ])

const $store = useStore()
const $textC = inject('$textC')
const $alignedGC = inject('$alignedGC')
const $tokensEC = inject('$tokensEC')

const segref = ref(null)

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

  isLast: {
    type: Boolean,
    required: false,
    default: false
  },

  blockTokensActionsFlag: {
    type: Number,
    required: false,
    default: 1
  }
})

const state = reactive({
  updated: 1,
  colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
  originColor: '#F8F8F8',
  showActionsMenuFlag: false,
  actionsToken: null,
  actionsMenuLeft: 0,
  actionsMenuTop: 0,
  deactivated: 1,
  containerWidth: 0,

  updateTokenIdWord: null,
  mergeTokenPrevIdWord: null,
  mergeTokenNextIdWord: null,
  splitTokenIdWord: null,
  addLineBreakIdWord: null,
  removeLineBreakIdWord: null
})

watch( 
  () => props.blockTokensActionsFlag, 
  () => {
    removeAllActivated()
  }
)

const segment = computed(() => {
  return $store.state.uploadPartNum && $store.state.reuploadTextsParts && $textC.getSegment(props.textType, props.textId, props.segmentIndex)
})

const direction = computed(() => {
  return segment.value.direction
})

const lang = computed(() => {
  return $store.state.alignmentUpdated && segment.value.lang
})

const cssId = computed(() => {
  if (props.textType === 'target') {
    return `alpheios-align-text-segment-${props.textType}-${props.targetId}-${segment.value.index}`
  } else {
    return `alpheios-align-text-segment-${props.textType}-${segment.value.index}`
  }
})

const cssStyle = computed(() => {
  if (props.textType === 'target') {
    return `order: ${segment.value.index}; background: ${state.colors[targetIdIndex.value]};`
  } else {
    return `order: ${segment.value.index}; background: ${state.originColor};`
  }
})

const cssClass = computed(() => {
  let classes = {}
  classes[`alpheios-align-text-segment-${props.textType}`] = true
  classes[`alpheios-align-text-segment-${props.textType}-last`] = props.isLast
  return classes
})

const allTargetTextsIds = computed(() => {
  return $store.state.alignmentUpdated ? $textC.allTargetTextsIds : []
})

const targetIdIndex = computed(() => {
  return targetId.value ? allTargetTextsIds.value.indexOf(targetId.value) : null
})

const targetId = computed(() => {
  return (segment.value.textType === 'target') ? segment.value.docSourceId : null
})

const alignmentGroupsWorkflowAvailable = computed(() => {
  return $store.state.alignmentUpdated && $alignedGC.alignmentGroupsWorkflowAvailable
})

const currentPartIndexes = computed(() => {
  return $store.state.uploadPartNum && $store.state.reuploadTextsParts ? segment.value.currentPartNums : []
})

const allTokens = computed(() => { 
  return  $store.state.tokenUpdated && $store.state.uploadPartNum && $store.state.reuploadTextsParts ? segment.value.tokens : []
})

const amountOfSegments = computed(() => { 
  return $alignedGC.getAmountOfSegments(segment.value)
})

const showPrev = computed(() => { 
  return allPartsKeys.value.length > 0 && (Math.min(...currentPartIndexes.value) > allPartsKeys.value[0].partNum)
})

const showNext = computed(() => { 
  return allPartsKeys.value.length > 0 && (Math.max(...currentPartIndexes.value) < allPartsKeys.value[allPartsKeys.value.length-1].partNum)
})

const allPartKeysLen = computed(() => { 
  const sumArr = (total, partData) => total + partData.len
  return allPartsKeys.value.length > 1 ? allPartsKeys.value.reduce(sumArr, 0) : 0
})

const allPartsKeys = computed(() => { 
  return  $store.state.tokenUpdated && $store.state.reuploadTextsParts && segment.value.allPartNums ? segment.value.allPartNums : []
})

const partBlockStyle = (len) => {
  const percentLen = Math.floor(len*100/allPartKeysLen.value)
  return `width: ${percentLen}%;`
}

const hideActionsMenu = () => {
  state.showActionsMenuFlag = false
}

const showActionsMenu = (data) => {
  
  state.actionsToken = data.token
  state.actionsMenuLeft = data.leftPos
  state.actionsMenuTop = data.topPos
  state.containerWidth = segref.value.offsetWidth
  state.showActionsMenuFlag = true
}

const removeAllActivatedEvent = () => {
  emit('removeAllActivated')
}

const removeAllActivated = () => {
  state.showActionsMenuFlag = false
  state.deactivated++
}

const clearPrevIdWord = async (token, typeName) => {
  if (token.idWord === state[typeName]) {
    state[typeName] = null
    await nextTick()
  }
}

const updateTokenWord = async (token) => {
  await clearPrevIdWord(token, 'updateTokenIdWord')
  state.updateTokenIdWord = token.idWord
}

const mergeToken = async (token, direction) => {
  if (direction === HistoryStep.directions.PREV) {
    await clearPrevIdWord(token, 'mergeTokenPrevIdWord')
    state.mergeTokenPrevIdWord = token.idWord
  }
  if (direction === HistoryStep.directions.NEXT) {
    await clearPrevIdWord(token, 'mergeTokenNextIdWord')
    state.mergeTokenNextIdWord = token.idWord
  }
}

const splitToken = async (token) => {
  await clearPrevIdWord(token, 'splitTokenIdWord')
  state.splitTokenIdWord = token.idWord
}

const addLineBreak = async (token) => {
  await clearPrevIdWord(token, 'removeLineBreakIdWord')
  state.addLineBreakIdWord = token.idWord
}

const removeLineBreak = async (token) => {
  await clearPrevIdWord(token, 'removeLineBreakIdWord')
  state.removeLineBreakIdWord = token.idWord
}

const moveToNextSegment = (token) => {
  $tokensEC.moveToSegment(token, HistoryStep.directions.NEXT)
  removeAllActivated()
}

const moveToPrevSegment = (token) => {
  $tokensEC.moveToSegment(token, HistoryStep.directions.PREV)
  removeAllActivated()
}

const deleteToken = (token) => {
  $tokensEC.deleteToken(token)
  removeAllActivated()
}

const insertTokens = (token) => {
  emit('insertTokens', token)
  removeAllActivated()
}

</script>

<style lang="scss">
  .alpheios-alignment-editor-align-text-segment-edit {
    position: relative;
  }
</style>