<template>
  <div class="alpheios-alignment-editor-initial-screen">
      <div class="alpheios-alignment-editor-initial-screen__intro">
        <div class="alpheios-header-logo">
          <img src="images/alpheios-logo-black-2.png" class="alpheios-logo">
        </div>

        <h2 class="alpheios-alignment-editor-initial-screen__heading">Alignment Editor</h2>
        <h2 class="alpheios-heading-animated alpheios-alignment-editor-initial-screen__heading-animated">
            <span>A</span><span>l</span><span>i</span><span>g</span><span>n</span><span>m</span><span>e</span><span>n</span><span>t</span> &nbsp; 
            <span>E</span><span>d</span><span>i</span><span>t</span><span>o</span><span>r</span>
        </h2>

        <div class="alpheios-alignment-editor-initial-screen__buttons">

          <div class="alpheios-alignment-editor-initial-screen__button">
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-main-button"  
                  id="alpheios-editor-start-new-alignment"
                  @click="startNewAlignment" >
                {{ l10n.getMsgS('INITIAL_NEW_ALIGNMENT') }}
            </button>
          </div>

          <div class="alpheios-alignment-editor-initial-screen__button">
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-main-button"  
                  id="alpheios-editor-resume-prev-alignment"
                  @click="resumePrevAlignment" >
                {{ l10n.getMsgS('INITIAL_RESUME_ALIGNMENT') }}
            </button>

            <div class="alpheios-alignment-app-menu__upload-block-choice" v-show="state.showUploadBlock" >
              <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-main-button" 
                :class="{ 'alpheios-active': state.showUploadFromFile }" 
                id="alpheios-editor-resume-prev-alignment_file"
                @click="updateShowBlock('fromFile')" >
                {{ l10n.getMsgS('INITIAL_CHOOSE_FROM_FILE') }}
              </button>
              <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-main-button"  
                :class="{ 'alpheios-active': state.showUploadFromDB }" 
                id="alpheios-editor-resume-prev-alignment_autosaved"
                @click="updateShowBlock('fromDB')" >
                {{ l10n.getMsgS('INITIAL_CHOOSE_FROM_DB') }}
              </button>
            </div>

            <div class="alpheios-alignment-app-menu__upload-block" v-show="state.showUploadFromFile" >
                <span class="alpheios-main-menu-upload-block_item">
                    <input type="file" id = "alpheiosfileuploadpage" ref="alpheiosfileuploadpage" 
                          class="alpheios-fileupload" @change="loadTextFromFile">
                    <label for="alpheiosfileuploadpage" class="alpheios-fileupload-label alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-upload">
                        {{ l10n.getMsgS('INITIAL_CHOOSE_FILE') }} 
                    </label>
                </span>
            </div>

            <div class="alpheios-alignment-editor-initial-screen__alignments-container" 
                  v-show="state.showUploadFromDB" v-if="indexedDBAvailable">
                <Suspense>
                  <alignments-list 
                      @upload-data-from-db="uploadDataFromDB" @delete-data-from-db="deleteDataFromDB"
                      @clear-all-alignments="$emit('clear-all-alignments')"
                  />
                </Suspense>
            </div>

          </div>

        </div>

        <page-links />
      </div>
  </div>

</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import AlignmentsList from '@/vue/alignments-list.vue'
import PageLinks from '@/vue/page-links.vue'

import { reactive, ref, inject, computed, defineAsyncComponent } from 'vue'

const alpheiosfileuploadpage = ref(null)

const $textC = inject('$textC')
const l10n = computed(() => { return L10nSingleton })

const state = reactive({ 
  showUploadBlock: false,
  showUploadFromFile: false,
  showUploadFromDB: false
})

const emit = defineEmits([ 'upload-data-from-file', 'new-initial-alignment', 'upload-data-from-db', 'delete-data-from-db', 'clear-all-alignments' ])

const indexedDBAvailable = computed(() => {
  return $textC.indexedDBAvailable
})

const startNewAlignment = () => {
  emit("new-initial-alignment")
  state.showUploadBlock = false
  state.showUploadFromDB = false
}

const resumePrevAlignment = () => {
  state.showUploadBlock = true
}

const updateShowBlock = (typeUpload) => {
  if (typeUpload === 'fromFile') {
    state.showUploadFromFile = true
    state.showUploadFromDB = false
  } else {
    state.showUploadFromFile = false
    state.showUploadFromDB = true
  }
}

const loadTextFromFile = () => {
  const file = alpheiosfileuploadpage.value.files[0]

  if (!file) { return }
  const extension = file.name.indexOf('.') > -1 ? file.name.split('.').pop() : ''

  if (!$textC.checkUploadedFileByExtension(extension)) { 
    alpheiosfileuploadpage.value.value = ''
    return 
  }

  const reader = new FileReader()

  reader.onload = e => {
    emit("upload-data-from-file", e.target.result, extension)
    state.showUploadBlock = false
    alpheiosfileuploadpage.value.value = ''
  }
  reader.readAsText(file)
}

const uploadDataFromDB = (alData) => {
  emit('upload-data-from-db', alData)
  state.showUploadBlock = false
  state.showUploadFromDB = false
}

const deleteDataFromDB = (alData) => {
  emit('delete-data-from-db', alData)
}

</script>

<style lang="scss">

.alpheios-alignment-editor-initial-screen__intro {
    background-repeat: repeat-y;
    background-position: 98% 20%;
    background-size: 20% auto;
    // overflow: hidden;
    min-height: 100vh;
    background-color: #bce5f0;
}

.alpheios-alignment-editor-initial-screen__heading {

    display: none;

    margin: 20px 60px;
    color: #0E2233;
    font-size: 80px;
    text-shadow: 2px 2px 3px rgb(0 0 0 / 60%);
    font-family: "Source Serif Pro", serif;
    text-align: center;

    @media screen and (max-width: 800px) {
      font-size: 32px;
      display: block;
    }
}


.alpheios-header-logo {
    text-align: center;
    padding-top: 20px;
    height: auto;

    .alpheios-logo {
        display: inline-block;
        width: 250px;
    }
}

.alpheios-alignment-editor-initial-screen__buttons {

    max-width: 1000px;
    width: 90%;
    margin: 0 auto;
    text-align: center;

    .alpheios-alignment-editor-initial-screen__button {
        width: 49%;
        display: inline-block;
        vertical-align: top;
        
     
        @media screen and (max-width: 800px) {
          margin-bottom: 20px;
          width: 100%;
         
        }

        .alpheios-actions-menu-main-button {
            font-weight: normal;
            font-size: 22px;
            text-align: center;
            white-space: normal;
            min-width: 330px;

            @media screen and (max-width: 800px) {
               min-width: auto;
            }
        }

        .alpheios-alignment-app-menu__upload-block {
            text-align: center;
            margin-top: 10px;

            padding: 10px 0;
            border-top: 1px solid #6e7a84;
            border-bottom: 1px solid #6e7a84;

            .alpheios-main-menu-upload-block_item {
                padding: 0;
            }

            .alpheios-actions-menu-button-upload {
                background: #eee;
                color: #46788d;
                font-weight: normal;
            }
        }
        .alpheios-alignment-app-menu__upload-block-choice {
          text-align: center;
          padding: 10px 0;
          
          .alpheios-actions-menu-button {
            display: inline-block;
            vertical-align: middle;
            font-size: 95%;
            min-width: auto;
            margin: 5px;
          }
        }
    }
}


</style>