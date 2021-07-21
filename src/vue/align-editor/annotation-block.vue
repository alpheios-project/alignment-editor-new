<template>
  <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-annotations">
    <template v-slot:header >
        <h3 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('ANNOTATION_BLOCK_HEADER', { word: token.word }) }}</h3>
        <p class="alpheios-alignment-annotations-header__buttons" v-show="hasAnnotations">
          <button class="alpheios-editor-button-tertiary alpheios-annotation-save-button"  v-show="currentState !== 'list'"
              @click="showAnnotationsJournal" >
              {{ l10n.getMsgS('ANNOTATION_BLOCK_SHOW_LIST', { count: countAnnotations }) }}              
          </button>
          <button class="alpheios-editor-button-tertiary alpheios-annotation-add-button" v-show="currentState !== 'new'"
              @click="showNewAnnotation" >
              {{ l10n.getMsgS('ANNOTATION_BLOCK_ADD_ANNOTATION') }}              
          </button>
        </p>
    </template>
    <template v-slot:body >
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
            :class = "annotationClass(annotation.id)"
          >
          <td class="alpheios-alignment-editor-annotation-list-item__type">
            {{ annotationTypeValue(annotation.type) }}
          </td>
          <td class="alpheios-alignment-editor-annotation-list-item__text">
            <span @click = "toggleAnnotationText(annotation.id)">{{ annotation.text }}</span>
          </td>
          <td class="alpheios-alignment-editor-annotation-list-item__edit">
            <span @click = "editAnnotation(annotation)"><pen-icon /></span>
          </td>
        </tr>
      </table>
    </template>
    <template v-slot:footer>
      <p class="alpheios-alignment-annotations-footer__buttons" v-show = "currentState !== 'list'">
        <button class="alpheios-editor-button-tertiary alpheios-annotation-save-button" 
            @click="saveAnnotation" >
            {{ l10n.getMsgS('ANNOTATION_BLOCK_SAVE_BUTTON') }}
        </button>
      </p>
    </template>
  </modal>
</template>
<script>
import Modal from '@/vue/common/modal.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Annotation from '@/lib/data/annotation.js'

import PenIcon from '@/inline-icons/pen.svg'

export default {
  name: 'AnnotationBlock',
  components: {
    modal: Modal,
    penIcon: PenIcon
  },
  props: {
    showModal: {
      type: Boolean,
      required: false,
      default: false
    },
    token: {
      type: Object,
      required: true
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
  computed: {
    l10n () {
      return L10nSingleton
    },
    textareaId () {
      return `alpheios-alignment-editor-annotation-textarea-${this.token.idWord}`
    },
    annotationTypes () {
      return Annotation.allTypes
    },
    allAnnotations () {
      return this.$store.state.updateAnnotations && this.$textC.getAnnotations(this.token)
    },
    hasAnnotations () {
      return this.allAnnotations && this.allAnnotations.length > 0
    },
    countAnnotations () {
      return this.allAnnotations && this.allAnnotations.length > 0 ? this.allAnnotations.length : 0
    }
  },
  methods: {
    annotationTypeValue (anType) {
      return Annotation.types[anType]
    },
    saveAnnotation () {
      this.$emit('save-annotation', this.token, { id: this.annotationId, text: this.annotationText, type: this.annotationType })
      this.showAnnotationsJournal()
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
    annotationClass (id) {
      return {
        'alpheios-alignment-editor-annotation-list-item__full': this.fullTextAnnotations.includes(id)
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

      tr:nth-child(even) {
        background-color: #f2f2f2;
      }

      .alpheios-alignment-editor-annotation-list-item__edit {
        text-align: center;
        width: 50px;
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