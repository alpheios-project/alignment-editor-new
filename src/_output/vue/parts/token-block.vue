<template>
    <span class = "alpheios-token" :class="tokenClasses"
          :id = "elementId" :ref = "elementId"
          @mouseenter = "addHoverToken"
          @mouseleave = "removeHoverToken"
          @click = "checkAnnotations"
    >
        <span class = "alpheios-token-inner"> {{ props.token.beforeWord }}{{ props.token.word }}{{ props.token.afterWord }} </span>
        <span class = "alpheios-token-translation" 
              v-for = "(groupDataItem, groupDataIndex) in filteredGroupData" :key = "groupDataIndex"
              :lang = groupDataItem.targetLang
              v-html = "translationWord(groupDataItem)"
        >
        </span>
    </span>
</template>
<script setup>
import { computed, reactive, inject, onMounted, watch } from 'vue'
const emit = defineEmits([ 'addHoverToken', 'removeHoverToken' ])
const $modal = inject('$modal')

const props = defineProps({
  token: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    required: false,
    default: false
  },
  grouped: {
    type: Boolean,
    required: false,
    default: false
  },
  interlinearly: {
    type: Boolean,
    required: false,
    default: false
  },
  shownTabs: {
    type: Array,
    required: false,
    default: () => { return [] }
  }
})

const tokenClasses = computed(() => {
  return { 
    'alpheios-token-grouped': props.grouped,
    'alpheios-token-selected': props.selected,
    'alpheios-token-annotated': props.token.annotated
  }
})

const elementId = computed(() => {
  return `token-${props.token.idWord}`
})

const filteredGroupData = computed(() => {
  return props.interlinearly && props.grouped && props.shownTabs && props.token.groupDataTrans ? 
    props.token.groupDataTrans.filter(groupDataItem => props.shownTabs.includes(groupDataItem.targetId) ).sort((a, b) => props.shownTabs.indexOf(a.targetId) - props.shownTabs.indexOf(b.targetId)) : null
})

const checkAnnotations = () => {
  if (props.token.annotated) {
    $modal.show('annotations', { token: props.token })
  }
}

const addHoverToken = () => {
  if (!props.interlinearly) {
    emit('addHoverToken', props.token)
  }
}

const removeHoverToken = () => {
  if (!props.interlinearly) {
    emit('removeHoverToken', props.token)
  }
}

const translationWord = (groupDataItem) => {
  return groupDataItem.word ? groupDataItem.word : '&nbsp;'
}
</script>

<style lang="scss">
    .alpheios-al-editor-container-inner {
      span.alpheios-token {
          cursor: pointer;
          padding: 2px 2px 0 2px;
          margin-bottom: 2px;
          display: inline-block;
          vertical-align: top;

          .alpheios-token-inner {
            border: 1px solid transparent;
            display: inline-block;
            text-align: left;
          }

          &.alpheios-token-annotated .alpheios-token-inner {
            border-bottom: 1px solid;
          }

          .alpheios-token-translation {
            display: block;
            text-align: left;
          }

          .alpheios-token-translation {
            color: #9a9a9a;
            font-size: 95%;
          }
      }
  }
</style>