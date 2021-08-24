<template>
  <modal classes="alpheios-alignment-editor-modal-annotations" name="annotations" 
         :draggable="true" height="auto" 
         @before-open="beforeOpen" @before-close="beforeClose">
    <div class="alpheios-modal-header" v-if="token">
        <span class="alpheios-alignment-modal-close-icon" @click = "$modal.hide('annotations')">
            <x-close-icon />
        </span>
        <h3 class="alpheios-alignment-editor-modal-header">{{ token.word }}</h3>
    </div>
    <div class="alpheios-modal-body" v-if="token">
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
  </modal>
</template>
<script>
import XCloseIcon from '@/inline-icons/x-close.svg'

export default {
  name: 'AnnotationBlock',
  components: {
    xCloseIcon: XCloseIcon
  },
  data () {
    return {
      token: null,
      fullTextAnnotations: []
    }
  },
  computed: {
    allAnnotations () {
      return this.token.annotationData
    }
  },
  methods: {
    beforeOpen (data) {
      this.token = data.params.token
    },
    beforeClose () {
      this.token = null
    },
    annotationClass (annotation) {
      return {
        'alpheios-alignment-editor-annotation-list-item__full': this.fullTextAnnotations.includes(annotation.id)
      }
    },
    toggleAnnotationText (id) {
      const idIndex = this.fullTextAnnotations.indexOf(id)

      if (idIndex >= 0) {
        this.fullTextAnnotations.splice(idIndex, 1)
      } else {
        this.fullTextAnnotations.push(id)
      }
    }
  }
  
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-modal-annotations {
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
