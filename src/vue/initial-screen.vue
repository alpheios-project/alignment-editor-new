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
                <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-main-button"  id="alpheios-start-new-alignment"
                    @click="startNewAlignment" >
                    {{ l10n.getMsgS('INITIAL_NEW_ALIGNMENT') }}
                </button>
            </div>

            <div class="alpheios-alignment-editor-initial-screen__button">
                <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-main-button"  
                    @click="resumePrevAlignment" >
                    {{ l10n.getMsgS('INITIAL_RESUME_ALIGNMENT') }}
                </button>

                <div class="alpheios-alignment-app-menu__upload-block-choice" v-show="showUploadBlock" >
                  <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-main-button" 
                    :class="{ 'alpheios-active': showUploadFromFile }" 
                    @click="updateShowBlock('fromFile')" >
                    {{ l10n.getMsgS('INITIAL_CHOOSE_FROM_FILE') }}
                  </button>
                  <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-main-button"  
                    :class="{ 'alpheios-active': showUploadFromDB }" 
                    @click="updateShowBlock('fromDB')" >
                    {{ l10n.getMsgS('INITIAL_CHOOSE_FROM_DB') }}
                  </button>
                </div>

                <div class="alpheios-alignment-app-menu__upload-block" id="alpheios-main-menu-upload-block-page" v-show="showUploadFromFile" >
                    <span class="alpheios-main-menu-upload-block_item">
                        <input type="file" id = "alpheiosfileuploadpage" ref="alpheiosfileuploadpage" class="alpheios-fileupload" @change="loadTextFromFile">
                        <label for="alpheiosfileuploadpage" class="alpheios-fileupload-label alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-upload">
                            {{ l10n.getMsgS('INITIAL_CHOOSE_FILE') }} 
                        </label>
                    </span>
                </div>

                <div class="alpheios-alignment-editor-initial-screen__alignments-container" v-show="showUploadFromDB" v-if="indexedDBAvailable">
                    <alignments-list 
                        @upload-data-from-db="uploadDataFromDB" @delete-data-from-db="deleteDataFromDB"
                        @clear-all-alignments="$emit('clear-all-alignments')"
                    />
                </div>
            </div>
            
        </div>

        <page-links />
      </div>
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import AlignmentsList from '@/vue/alignments-list.vue'
import PageLinks from '@/vue/page-links.vue'

export default {
  name: 'InitialScreen',
  components: {
    alignmentsList: AlignmentsList,
    pageLinks: PageLinks
  },
  data () {
    return {
      showUploadBlock: false,
      showVideo: false,
      alignments: [],
      showUploadFromFile: false,
      showUploadFromDB: false
    }
  },
  mounted () {
    setTimeout(() => {
      this.showVideo = true
    }, 1500)
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    readyAlignments () {
      return this.alignments && this.alignments.length > 0
    },
    indexedDBAvailable () {
      return this.$textC.indexedDBAvailable
    }
  },
  methods: {
    startNewAlignment () {
      this.$emit("new-initial-alignment")
      this.showUploadBlock = false
      this.showUploadFromDB = false
    },
    resumePrevAlignment () {
      this.showUploadBlock = true
    },
    loadTextFromFile() {
      const file = this.$refs.alpheiosfileuploadpage.files[0]

      if (!file) { return }
      const extension = file.name.indexOf('.') > -1 ? file.name.split('.').pop() : ''

      if (!this.$textC.checkUploadedFileByExtension(extension)) { 
        this.$refs.alpheiosfileuploadpage.value = ''
        return 
      }

      const reader = new FileReader()

      reader.onload = e => {
        this.$emit("upload-data-from-file", e.target.result, extension)
        this.showUploadBlock = false
        this.$refs.alpheiosfileuploadpage.value = ''
      }
      reader.readAsText(file)
    },

    uploadDataFromDB (alData) {
      this.$emit('upload-data-from-db', alData)
      this.showUploadBlock = false
      this.showUploadFromDB = false
    },

    deleteDataFromDB (alData) {
      this.$emit('delete-data-from-db', alData)
    },

    updateShowBlock (typeUpload) {
      if (typeUpload === 'fromFile') {
        this.showUploadFromFile = true
        this.showUploadFromDB = false
      } else {
        this.showUploadFromFile = false
        this.showUploadFromDB = true
      }
    }
  }
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
            border-color: #6e7a84;
            border-width: 1px;

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
          }
        }
    }
}


</style>

