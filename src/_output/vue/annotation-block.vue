<template>
  <modal-base modalName="annotations" :draggable="true" height="auto" 
         @before-open="beforeOpen" @before-close="beforeClose">
    <div class="alpheios-alignment-editor-modal-annotations">
      <div class="alpheios-modal-header " v-if="state.token">
          <span class="alpheios-alignment-modal-close-icon" @click = "$modal.hide('annotations')">
              <x-close-icon />
          </span>
          <h3 class="alpheios-alignment-editor-modal-header">Annotation for {{ state.token.word }}</h3>
      </div>
      <div class="alpheios-modal-body" v-if="state.token">
        <table class = "alpheios-alignment-editor-annotation-list">
          <tr class="alpheios-alignment-editor-annotation-list-item" 
              v-for="annotation in allAnnotations" :key="annotation.id"
              :class = "annotationClass(annotation)"
            >
            <td class="alpheios-alignment-editor-annotation-list-item__type">
              {{ annotation.type }}
            </td>
            <td class="alpheios-alignment-editor-annotation-list-item__type">
              {{ annotation.index }}
            </td>
            <td class="alpheios-alignment-editor-annotation-list-item__text">
              <span @click = "toggleAnnotationText(annotation.id)">{{ annotation.text }}</span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </modal-base>
</template>
<script setup>
import XCloseIcon from '@/inline-icons/xclose.svg'
import { computed, reactive, inject, onMounted, watch } from 'vue'

const $modal = inject('$modal')

const state = reactive({
  token: null,
  fullTextAnnotations: []
})

const allAnnotations = computed(() => {
  return state.token.annotationData
})

const beforeOpen = (data) => {
  state.token = data.params.token
}

const beforeClose = () => {
  state.token = null
}

const annotationClass = (annotation) => {
  return {
    'alpheios-alignment-editor-annotation-list-item__full': state.fullTextAnnotations.includes(annotation.id)
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

</script>

<style lang="scss">
  .alpheios-alignment-editor-modal-annotations {
    .alpheios-alignment-modal-close-icon {
      top: -10px;
      right: -10px;
    }

    .alpheios-modal-body {
        border: 0;
        padding: 0;
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
    }


  }
</style>
