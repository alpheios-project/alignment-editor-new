<template>
  <modal-base modalName="annotation" :draggable="true" height="auto" :shiftY="0.3" data-alpheios-ignore="all" > 
    <div class="alpheios-alignment-editor-modal-annotations" :draggable="true" height="auto" data-alpheios-ignore="all">
      <div class="alpheios-modal-header" v-if="props.token">
          <span class="alpheios-alignment-modal-close-icon" @click = "closeModal">
              <x-close-icon />
          </span>
          <h3 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('ANNOTATION_BLOCK_HEADER', { word: props.token.word }) }}</h3>
          <p class="alpheios-alignment-annotations-header__buttons" >
            <button class="alpheios-editor-button-tertiary alpheios-annotation-save-button"  v-show="state.currentState !== 'list' && hasAnnotations"
                @click="showAnnotationsJournal" >
                {{ l10n.getMsgS('ANNOTATION_BLOCK_SHOW_LIST', { count: countAnnotations }) }}              
            </button>
            <button class="alpheios-editor-button-tertiary alpheios-annotation-add-button" v-show="state.currentState !== 'new'"
                @click="showNewAnnotation" >
                {{ l10n.getMsgS('ANNOTATION_BLOCK_ADD_ANNOTATION') }}              
            </button>
          </p>
      </div>

      <div class="alpheios-modal-body" v-if="props.token">
        <div class = "alpheios-alignment-editor-annotation-new" v-show="state.currentState !== 'list'">
          <div class="alpheios-alignment-editor-annotation-select">
              <select class="alpheios-alignment-select" v-model="state.annotationType">
                  <option v-for="(anType, anIndex) in annotationTypes" :key="anIndex" :value="anType">{{ annotationTypeValue(anType) }}</option>
              </select>
          </div>


          <div class="alpheios-alignment-editor-annotation-text-block">
              <p class="alpheios-alignment-editor-text-blocks-info-line">
                <span class="alpheios-alignment-editor-text-blocks-single__characters" :class = "charactersClasses">{{ charactersText }}</span>
              </p>
              <textarea :id="textareaId" v-model="state.annotationText" 
                  class="alpheios-alignment-editor-annotation-textarea">
              </textarea>
          </div>
        </div>


        <table class = "alpheios-alignment-editor-annotation-list" v-show="state.currentState === 'list'">
          <tr class="alpheios-alignment-editor-annotation-list-item" 
              v-for="annotation in allAnnotations" :key="annotation.id"
              :class = "annotationClass(annotation)"
            >
            <td class="alpheios-alignment-editor-annotation-list-item__type">
              {{ annotationTypeValue(annotation.type) }}
            </td>
            <td class="alpheios-alignment-editor-annotation-list-item__type">
              {{ annotation.index }}
            </td>
            <td class="alpheios-alignment-editor-annotation-list-item__text">
              <span @click = "toggleAnnotationText(annotation.id)">{{ annotation.text }}</span>
            </td>
            <td class="alpheios-alignment-editor-annotation-list-item__edit">
              <span @click = "editAnnotation(annotation)" v-if="isAnnotationEditable(annotation)"><pen-icon /></span>
              <span @click = "deleteAnnotation(annotation)" v-if="isAnnotationEditable(annotation)"><delete-icon /></span>
            </td>
          </tr>
        </table>
      </div>

      <div class="alpheios-modal-footer" v-if="props.token">
        <p class="alpheios-alignment-annotations-footer__buttons" v-show = "state.currentState !== 'list'">
          <button class="alpheios-editor-button-tertiary alpheios-annotation-save-button" 
              @click="saveAnnotation" :disabled="textCharactersAmount > maxCharactersForTheText">
              {{ l10n.getMsgS('ANNOTATION_BLOCK_SAVE_BUTTON') }}
          </button>
        </p>
      </div>
    </div>
  </modal-base>
</template>
<script setup>
import XCloseIcon from '@/inline-icons/xclose.svg'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Annotation from '@/lib/data/annotation.js'

import PenIcon from '@/inline-icons/pen.svg'
import DeleteIcon from '@/inline-icons/delete.svg'

import SettingsController from '@/lib/controllers/settings-controller.js'

import { computed, inject, reactive } from 'vue'

import { useStore } from 'vuex'

const l10n = computed(() => { return L10nSingleton })
const $store = useStore()

const $modal = inject('$modal')
const $textC = inject('$textC')
const $alignedGC = inject('$alignedGC')

const props = defineProps({
  token: {
    type: Object,
    required: false
  }
})

const state = reactive({
  annotationId: null,
  annotationText: '',
  annotationType: 'COMMENT',
  states: ['new', 'list', 'edit'],
  currentState: 'new',
  fullTextAnnotations: []
})

const closeModal = () => {
  $modal.hide('annotation')
}

const textareaId = computed(() => {
  defineCurrentState()
  return `alpheios-alignment-editor-annotation-textarea-${props.token.idWord}`
})


const annotationTypes = computed(() => {
  state.annotationType = SettingsController.availableAnnotationTypes[0]
  return $store.state.optionsUpdated && SettingsController.availableAnnotationTypes
})

const allAnnotations = computed(() => {
  return $store.state.updateAnnotations && $textC.getAnnotations(props.token)
})

const hasAnnotations = computed(() => {
  return $store.state.updateAnnotations && $textC.hasTokenAnnotations(props.token)
})

const countAnnotations = computed(() => {
  return allAnnotations.value && allAnnotations.value.length > 0 ? allAnnotations.value.length : 0
})

const textCharactersAmount = computed(() => {
  return state.annotationText ? state.annotationText.length : 0
})

const maxCharactersForTheText = computed(() => {
  return $store.state.optionsUpdated && SettingsController.maxCharactersAnnotationText
})

const charactersText = computed(() => {
  return `Characters count - ${textCharactersAmount.value} (max - ${maxCharactersForTheText.value})`
})

const charactersClasses = computed(() => {
  return {
    'alpheios-alignment-editor-hidden' : (textCharactersAmount.value === 0),
    'alpheios-alignment-editor-red' :  (textCharactersAmount.value > maxCharactersForTheText.value)
  }
})

const defineCurrentState = () => {
  if (hasAnnotations.value) {
    state.currentState = 'list'
  } else {
    state.currentState = 'new'
  }
}

const annotationTypeValue = (anType) => {
  return Annotation.types[anType]
}

const saveAnnotation = () => {
  const result = $textC.addAnnotation({
    token: props.token,
    id: state.annotationId,
    text: state.annotationText,
    type: state.annotationType
  })

  if (result) {
    showAnnotationsJournal()
  }
}

const showAnnotationsJournal = () => {
  state.currentState = 'list'
  state.annotationId = null
  state.annotationText = ''
}

const showNewAnnotation = () => {
  state.currentState = 'new'
  state.annotationId = null
  state.annotationText = ''
}

const isAnnotationEditable = (annotation) => {
  return $textC.annotationIsEditable(annotation)
}

const annotationClass = (annotation) => {
  return {
    'alpheios-alignment-editor-annotation-list-item__full': state.fullTextAnnotations.includes(annotation.id),
    'alpheios-alignment-editor-annotation-list-item__disabled': !isAnnotationEditable(annotation)
  }
}

const toggleAnnotationText = (id) => {
  const idIndex = state.fullTextAnnotations.indexOf(id)

  if (idIndex >= 0) {
    state.fullTextAnnotations.splice(idIndex, 1)
  } else {
    state.fullTextAnnotations.push(id)
  }
}

const editAnnotation = (annotation)  =>{
  state.annotationId = annotation.id
  state.annotationType = annotation.type
  state.annotationText = annotation.text
  state.currentState = 'edit'
}

const deleteAnnotation = (annotation) =>{
  $textC.removeAnnotation(props.token, annotation.id)
}
</script>

<style lang="scss">
  .alpheios-alignment-editor-modal-annotations {
    .alpheios-modal-body {
        border: 0;
        padding: 0;
    }

    span.alpheios-alignment-editor-red {
      color: #99002a;
    }

    .alpheios-alignment-editor-annotation-textarea {
        width: 100%;
        min-height: 150px;
        padding: 10px;
        font-size: inherit;
    }

    .alpheios-alignment-editor-annotation-select {
        margin-bottom: 15px;
    }

    .alpheios-alignment-editor-annotation-list {
      border-collapse: collapse;
      width: 100%;

      td {
        border: 1px solid #ddd;
        padding: 8px;

        &.alpheios-alignment-editor-annotation-list-item__type {
          width: 100px;
        }

        &.alpheios-alignment-editor-annotation-list-item__text {
          max-width: 10vw;
          span {
            display: block;
            white-space: nowrap; 
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: pointer;
          }
        }
      }
      .alpheios-alignment-editor-annotation-list-item__full {
        .alpheios-alignment-editor-annotation-list-item__text span {
          text-overflow: inherit;
          overflow: inherit;
          white-space: initial;
        }
      }

      .alpheios-alignment-editor-annotation-list-item__disabled {
        color: #a6a6a6;
      }

      tr:nth-child(even) {
        background-color: #f2f2f2;
      }

      .alpheios-alignment-editor-annotation-list-item__edit {
        text-align: center;
        width: 100px;
        span {
          display: inline-block;
          width: 20px;
          height: 20px;
          cursor: pointer;

          svg {
            display: block;
            width: 100%;
            height: 100%;
          }
        }
      }
    }


  }
</style>