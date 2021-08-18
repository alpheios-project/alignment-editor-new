<template>
  <modal classes="alpheios-alignment-editor-modal-annotations" name="annotations" :draggable="true" height="auto">
    <div class="alpheios-modal-header" v-if="token">
        <span class="alpheios-alignment-modal-close-icon" @click = "$emit('closeModal')">
            <x-close-icon />
        </span>
        <h3 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('ANNOTATION_BLOCK_HEADER', { word: token.word }) }}</h3>
        <p class="alpheios-alignment-annotations-header__buttons" >
          <button class="alpheios-editor-button-tertiary alpheios-annotation-save-button"  v-show="currentState !== 'list' && hasAnnotations"
              @click="showAnnotationsJournal" >
              {{ l10n.getMsgS('ANNOTATION_BLOCK_SHOW_LIST', { count: countAnnotations }) }}              
          </button>
          <button class="alpheios-editor-button-tertiary alpheios-annotation-add-button" v-show="currentState !== 'new'"
              @click="showNewAnnotation" >
              {{ l10n.getMsgS('ANNOTATION_BLOCK_ADD_ANNOTATION') }}              
          </button>
        </p>
    </div>
    <div class="alpheios-modal-body" v-if="token">
      <div class = "alpheios-alignment-editor-annotation-new" v-show="currentState !== 'list'">
        <div class="alpheios-alignment-editor-annotation-select">
            <select class="alpheios-alignment-select" v-model="annotationType">
                <option v-for="(anType, anIndex) in annotationTypes" :key="anIndex" :value="anType">{{ annotationTypeValue(anType) }}</option>
            </select>
        </div>
        <div class="alpheios-alignment-editor-annotation-text-block">
            <textarea :id="textareaId" v-model="annotationText" 
                class="alpheios-alignment-editor-annotation-textarea">
            ></textarea>
        </div>
      </div>
      <table class = "alpheios-alignment-editor-annotation-list" v-show="currentState === 'list'">
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
    <div class="alpheios-modal-footer" v-if="token">
      <p class="alpheios-alignment-annotations-footer__buttons" v-show = "currentState !== 'list'">
        <button class="alpheios-editor-button-tertiary alpheios-annotation-save-button" 
            @click="saveAnnotation" >
            {{ l10n.getMsgS('ANNOTATION_BLOCK_SAVE_BUTTON') }}
        </button>
      </p>
    </div>
  </modal>
</template>
<script>
import XCloseIcon from '@/inline-icons/x-close.svg'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Annotation from '@/lib/data/annotation.js'

import PenIcon from '@/inline-icons/pen.svg'
import DeleteIcon from '@/inline-icons/delete.svg'

import SettingsController from '@/lib/controllers/settings-controller.js'

export default {
  name: 'AnnotationBlock',
  components: {
    penIcon: PenIcon,
    deleteIcon: DeleteIcon,
    xCloseIcon: XCloseIcon
  },
  props: {
    token: {
      type: Object,
      required: false
    }
  },
  data () {
    return {
      annotationId: null,
      annotationText: null,
      annotationType: 'COMMENT',
      states: ['new', 'list', 'edit'],
      currentState: 'new',
      fullTextAnnotations: []
    }
  },
  mounted () {
    if (this.hasAnnotations) {
      this.currentState = 'list'
    } else {
      this.currentState = 'new'
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    textareaId () {
      return `alpheios-alignment-editor-annotation-textarea-${this.token.idWord}`
    },
    annotationTypes () {
      this.annotationType = SettingsController.availableAnnotationTypes[0]
      return this.$store.state.optionsUpdated && SettingsController.availableAnnotationTypes
    },
    allAnnotations () {
      return this.$store.state.updateAnnotations && this.$textC.getAnnotations(this.token)
    },
    hasAnnotations () {
      return this.$store.state.updateAnnotations && this.$textC.hasTokenAnnotations(this.token)
    },
    countAnnotations () {
      return this.allAnnotations && this.allAnnotations.length > 0 ? this.allAnnotations.length : 0
    },
    isEditable () {
      return this.$store.state.updateAnnotations && this.$textC.annotationIsEditable(annotation)
    }
  },
  methods: {
    annotationTypeValue (anType) {
      return Annotation.types[anType]
    },
    saveAnnotation () {
      const result = this.$textC.addAnnotation({
        token: this.token,
        id: this.annotationId,
        text: this.annotationText,
        type: this.annotationType
      })

      if (result) {
        this.showAnnotationsJournal()
      }
    },
    showAnnotationsJournal () {
      this.currentState = 'list'
      this.annotationId = null
      this.annotationText = ''
    },
    showNewAnnotation () {
      this.currentState = 'new'
      this.annotationId = null
      this.annotationText = ''
    },
    isAnnotationEditable (annotation) {
      return this.$textC.annotationIsEditable(annotation)
    },
    annotationClass (annotation) {
      return {
        'alpheios-alignment-editor-annotation-list-item__full': this.fullTextAnnotations.includes(annotation.id),
        'alpheios-alignment-editor-annotation-list-item__disabled': !this.isAnnotationEditable(annotation)
      }
    },
    toggleAnnotationText (id) {
      const idIndex = this.fullTextAnnotations.indexOf(id)

      if (idIndex >= 0) {
        this.fullTextAnnotations.splice(idIndex, 1)
      } else {
        this.fullTextAnnotations.push(id)
      }
    },
    editAnnotation (annotation) {
      this.annotationId = annotation.id
      this.annotationType = annotation.type
      this.annotationText = annotation.text
      this.currentState = 'edit'
    },
    deleteAnnotation (annotation) {
      this.$textC.removeAnnotation(this.token, annotation.id)
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