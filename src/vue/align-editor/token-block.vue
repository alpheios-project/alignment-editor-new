<template>
    <span :data-type = "props.token.textType" :id = "elementId"
          @click.exact.prevent = "clickToken"
          @click.shift.stop = "clickTokenShift"
          @mouseover = "addHoverToken"
          @mouseleave = "removeHoverToken"
          class = "alpheios-token"
          :class="tokenClasses"
    >
        {{ tokenBeforeWord }}{{ tokenWord }}{{ tokenAfterWord }}
    </span>
</template>
<script setup>
import SettingsController from '@/lib/controllers/settings-controller.js'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()
const $textC = inject('$textC')

const emit = defineEmits([ 'update-annotation', 'update-alignment-group', 'add-hover-token', 'remove-hover-token' ])

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
  inActiveGroup: {
    type: Boolean,
    required: false,
    default: false
  },
  firstInActiveGroup: {
    type: Boolean,
    required: false,
    default: false
  },
  firstTextInActiveGroup: {
    type: Boolean,
    required: false,
    default: false
  },
  annotationMode: {
    type: Boolean,
    required: false,
    default: false
  }
})

const tokenClasses = computed(() => {
  return { 
    'alpheios-token-selected': props.selected, 
    'alpheios-token-grouped': props.grouped ,
    'alpheios-token-clicked': props.inActiveGroup,
    'alpheios-token-clicked-first': props.firstInActiveGroup,
    'alpheios-token-clicked-first-text': props.firstTextInActiveGroup,
    'alpheios-token-part-shadowed': (props.token.partNum % 2 === 0),
    'alpheios-token-annotated': hasAnnotations.value,
    'alpheios-token-annotation-mode': props.annotationMode
  }
})

const tokenWord = computed(() => {
  return $store.state.tokenUpdated && props.token.word
})

const tokenBeforeWord = computed(() => {
  return $store.state.tokenUpdated && props.token.beforeWord
})

const tokenAfterWord = computed(() => {
  return $store.state.tokenUpdated && props.token.afterWord
})

const elementId = computed(() => {
  return `token-${props.token.idWord}`
})

const clickToken = computed(() => {
  return useModeStructureValue.value ? clickTokenMode.value : updateAlignmentGroup
})

const clickTokenMode = computed(() => {
  return props.annotationMode ? updateAnnotation : updateAlignmentGroup
})

const clickTokenShift = computed(() => {
  document.getSelection().removeAllRanges()
  return useModeStructureValue.value ? null : updateAnnotation
})

const hasAnnotations = computed(() => {
  return enableAnnotationsValue.value && $store.state.updateAnnotations && $textC.getAnnotations(props.token).length > 0
})

const enableAnnotationsValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableAnnotations
})

const useModeStructureValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.useModeStructure
})

const updateAnnotation = () => {
  if (enableAnnotationsValue.value) {
    emit('update-annotation', props.token)
  }
}

const updateAlignmentGroup = (event) => {
  emit('update-alignment-group', props.token)
}

const addHoverToken = () => {
  if (!props.annotationMode) {
    emit('add-hover-token', props.token)
  }
}

const removeHoverToken = () => {
  if (!props.annotationMode) {
    emit('remove-hover-token', props.token)
  }
}

</script>

<style lang="scss">
    .alpheios-alignment-editor-align-text-segment {
        span.alpheios-token {
            cursor: pointer;
            padding: 2px 2px 0 2px;
            margin-bottom: 2px;
            border: 1px solid transparent;
            display: inline-block;
            vertical-align: top;
            
            &.alpheios-token-part-shadowed {
              font-weight: bold;
            }

            &:hover {
                border-color: #FFC24F;
                background: #FFD27D;
            }
            &.alpheios-token-annotation-mode:hover {
              border-color: initial;
              background: initial;
            }

            &.alpheios-token-grouped {
              border-color: #BCE5F0;
              background: #BCE5F0;
            }

            &.alpheios-token-selected {
              border-color: #F27431;
              background: #F27431;
              color: #fff;
            }

            &.alpheios-token-clicked {
              border-color: #f59d6e;
              background: #f59d6e;
            }

            &.alpheios-token-clicked-first {
              border-color: #f06d26;
              background: #f06d26;
              color: #fff;
            }

            &.alpheios-token-clicked-first-text {
              border-color: #f06d26;
              background: #f06d26;
              color: #fff;
            }

            &.alpheios-token-annotated {
              border-bottom: 1px solid;
            }
        }
    }
</style>