<template>
  <div class="alpheios-alignment-editor-initial-screen">
      <div class="alpheios-alignment-editor-initial-screen__intro" style="background-image: url('images/books.svg')">
        <div class="alpheios-header-logo">
          <img src="images/alpheios-logo-black-2.png" class="alpheios-logo">
        </div>

        <h2 class="alpheios-alignment-editor-initial-screen__heading">Alignment Editor</h2>
        <h2 class="alpheios-alignment-editor-initial-screen__heading-animated">
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
                <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-main-button"  id="alpheios-resume"
                    @click="resumePrevAlignment" >
                    {{ l10n.getMsgS('INITIAL_RESUME_ALIGNMENT') }}
                </button>

                <div class="alpheios-alignment-app-menu__upload-block" id="alpheios-main-menu-upload-block-page" v-show="showUploadBlock" >
                    <span class="alpheios-main-menu-upload-block_item">
                        <input type="file" id = "alpheiosfileuploadpage" ref="alpheiosfileuploadpage" class="alpheios-fileupload" @change="loadTextFromFile">
                        <label for="alpheiosfileuploadpage" class="alpheios-fileupload-label alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-upload">
                            {{ l10n.getMsgS('INITIAL_CHOOSE_FILE') }} 
                        </label>
                    </span>
                </div>
            </div>
        </div>

        <div class="alpheios-alignment-editor-initial-screen__video" v-show="showVideo">
            <video-embed css="embed-responsive-21by9" src="https://youtu.be/TZa86G1uVOU"></video-embed>
        </div>
      </div>
  </div>
</template>
<script>
import Vue from "vue"
import Embed from "v-video-embed"
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

// global register
Vue.use(Embed)

export default {
  name: 'InitialScreen',
  data () {
    return {
      showUploadBlock: false,
      uploadFileName: null,
      showVideo: false
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
    }
  },
  methods: {
    startNewAlignment () {
      this.$emit("new-initial-alignment")
    },
    resumePrevAlignment () {
      this.showUploadBlock = true
    },
    loadTextFromFile() {
      const file = this.$refs.alpheiosfileuploadpage.files[0]

      if (!file) { return }
      const extension = file.name.split('.').pop()

      if (!this.$textC.checkUploadedFileByExtension(extension)) { 
        this.$refs.alpheiosfileuploadpage.value = ''
        return 
      }

      const reader = new FileReader()

      reader.onload = e => {
        this.$emit("upload-data", e.target.result, extension)
        this.showUploadBlock = false
      }
      reader.readAsText(file)
    }
  }
}
</script>
<style lang="scss">

.alpheios-alignment-editor-initial-screen__intro {
    background-repeat: repeat-y;
    background-position: 98% 20%;
    background-size: 20% auto;
    overflow: hidden;
    height: 100vh;
}

.alpheios-alignment-editor-initial-screen__heading {

    display: none;

    margin: 20px 60px;
    color: #0E2233;
    font-size: 80px;
    text-shadow: 2px 2px 3px rgb(0 0 0 / 60%);
    font-family: "Source Serif Pro", serif;
    text-align: center;
}

.alpheios-alignment-editor-initial-screen__video {

    text-align: center;
    iframe {
        margin: 0;
        border: 0; 
        width: 800px;
        height: 500px;
    }
}

.alpheios-header-logo {
    text-align: center;
    margin-top: 80px;
    height: 60px;

    .alpheios-logo {
        display: inline-block;
        width: 250px;
    }
}

.alpheios-alignment-editor-initial-screen__buttons {

    width: 700px;
    margin: 0 auto 50px;
    text-align: center;

    .alpheios-alignment-editor-initial-screen__button {
        width: 49%;
        display: inline-block;
        vertical-align: top;
        

        .alpheios-actions-menu-main-button {
            font-weight: normal;
            font-size: 22px;
            min-width: 315px;
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
    }
}

.alpheios-alignment-editor-initial-screen__heading-animated {
    min-height: 120px;
    margin: 20px 60px;
    color: #0E2233;
    font-size: 80px;
    text-shadow: 2px 2px 3px rgb(0 0 0 / 60%);
    font-family: "Source Serif Pro", serif;
    text-align: center;

    span {
        display: inline-block;
    }

    span:nth-of-type(2) {
        // animation-delay: .05s;
        animation-delay: .55s;
    }
    span:nth-of-type(3) {
        // animation-delay: .1s;
        animation-delay: .6s;
    }
    span:nth-of-type(4) {
        // animation-delay: .15s;
        animation-delay: .65s;
    }
    span:nth-of-type(5) {
        // animation-delay: .2s;
        animation-delay: .7s;
    }
    span:nth-of-type(6) {
        // animation-delay: .25s;
        animation-delay: .75s;
    }
    span:nth-of-type(7) {
        // animation-delay: .3s;
        animation-delay: .8s;
    }
    span:nth-of-type(8) {
        // animation-delay: .35s;
        animation-delay: .85s;
    }
    span:nth-of-type(9) {
        // animation-delay: .4s;
        animation-delay: .9s;
    }
    span:nth-of-type(10) {
        // animation-delay: .45s;
        animation-delay: .95s;
    }
    span:nth-of-type(11) {
        // animation-delay: .5s;
        animation-delay: 1s;
    }
    span:nth-of-type(12) {
        // animation-delay: .55s;
        animation-delay: 1.05s;
    }
    span:nth-of-type(13) {
        // animation-delay: .6s;
        animation-delay: 1.1s;
    }
    span:nth-of-type(14) {
        // animation-delay: .65s;
        animation-delay: 1.15s;
    }
    span:nth-of-type(15) {
        // animation-delay: .7s;
        animation-delay: 1.2s;
    }
    span:nth-of-type(16) {
        // animation-delay: .75s;
        animation-delay: 1.25s;
    }
    span:nth-of-type(17) {
        // animation-delay: .8s;
        animation-delay: 1.3s;
    }
    span:nth-of-type(18) {
        // animation-delay: .85s;
        animation-delay: 1.35s;
    }
    span:nth-of-type(19) {
        // animation-delay: .9s;
        animation-delay: 1.4s;
    }
    span:nth-of-type(20) {
        // animation-delay: .95s;
        animation-delay: 1.45s;
    }

    span {
        opacity: 0;
        transform: translate(-150px, -50px) rotate(-180deg) scale(3);
        animation: revolveScale .8s forwards;
        animation-delay: 0.5s;
    }
}

@keyframes revolveScale {
	60% {
		transform: translate(20px, 20px) rotate(30deg) scale(.3);
	}

	100% {
		transform: translate(0) rotate(0) scale(1);
		opacity: 1;
	}
}
</style>
