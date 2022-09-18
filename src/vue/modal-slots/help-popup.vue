<template>
  <modal-base :modalName="props.modalName" 
          :height="modalHeight" width="80%" :shiftY="0.3"
          :max-width="1300" :adaptive="true">  
    <div class="alpheios-alignment-editor-modal-help">
      <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click="$modal.hide(props.modalName)">
              <x-close-icon />
          </span>
          <h2 class="alpheios-alignment-editor-modal-header">Help</h2>
      </div>
      <div class="alpheios-modal-body" >
          <slot name="content"></slot>
      </div>
    </div>
  </modal-base>
</template>
<script setup>
import XCloseIcon from '@/inline-icons/xclose.svg'
import { reactive, ref, inject, computed, onMounted } from 'vue'

const $modal = inject('$modal')

const props = defineProps({
  modalName: {
    type: String,
    required: true
  }
})

const modalHeight = computed(() => {
  return props.modalName === 'help-edit' ? 'auto' : '80%' 
})
</script>

<style lang="scss">
.alpheios-alignment-editor-modal-help {
  height: 100%;

  .alpheios-modal-body {
    max-height: 93%;
    border: 0;
    padding: 0 15px 0 0;
    margin: 0 0 20px;
  }
  .alpheios-alignment-editor-modal-header {
    text-transform: uppercase;
    margin-bottom: 10px;
  }
}

.alpheios-editor-help-content {
  // text-indent: 10px;
  text-align: justify;

  .alpheios-editor-help-content-error {
      color: #f00;
      font-weight: bold;
  }
  
  .alpheios-editor-help-content-text {
    border-top: 2px solid #eee;
    border-bottom: 2px solid #eee;
    padding: 10px 0;
  }

  h4.alpheios-editor-help-content-title {
      margin: 10px 0 10px;
      color: #185F6D;
      cursor: pointer;
  }

  .alpheios-alignment-editor-add-translation {
    display: inline-block;
    width: 20px;
    height: 20px;
    cursor: pointer;
    margin: 0 5px;

    svg {
      display: inline-block;
      width: 100%;
      height: 100%;
    }
  }

  .alpheios-editor-help-content-text {
      a {
        color: #185F6D;
      }
      p {
        margin: 0;
        line-height: 160%;
        padding-left: 15px;

        &.alpheios-editor-help-content-text__image {
          text-align: center;

          &.alpheios-editor-help-content-text__image__wide img {
            width: 100%;
            max-width: 800px;
          }
        }
      }

      img {
        display: inline-block;
        width: 60%;
        margin: 10px 0; 
        max-width: 500px;
      }

      .alpheios-alignment-editor-add-translation {
          margin: 5px;
      }

      .alpheios-editor-help-content-special {
        padding: 20px;
        border: 1px solid #ddd;
        background: #eee;
        margin: 10px 0 10px;

        h5 {
          margin: 0 0 10px;
          font-size: 16px;
        }
      }

      .alpheios-editor-help-content-text__close-link {
          color: #185F6D;
          text-transform: uppercase;
          cursor: pointer;
      }
  }
}
</style>