<template>
  <div class="alpheios-alignment-app-menu">
      <div class="alpheios-alignment-app-menu__buttons">
        <button class="alpheios-button-tertiary" @click="$emit('download-data')" >{{ l10nGetMsg('MAIN_MENU_DOWNLOAD_TITLE') }}</button>
        <button class="alpheios-button-tertiary" @click="uploadTexts" >{{ l10nGetMsg('MAIN_MENU_UPLOAD_TITLE') }}</button>
        <button class="alpheios-button-tertiary" @click="$emit('align-texts')" >{{ l10nGetMsg('MAIN_MENU_ALIGN_TITLE') }}</button>
      </div>
      <div class="alpheios-alignment-app-menu__upload-block" v-show="showUploadBlock">
        <input type="file" @change="loadTextFromFile">
      </div>
  </div>
</template>
<script>
import L10n from '@/lib/l10n/l10n.js'

export default {
  name: 'MainMenu',
  data () {
    return {
      showUploadBlock: false
    }
  },
  methods: {
    uploadTexts () {
      this.showUploadBlock = true
    },
    loadTextFromFile(ev) {
      const file = ev.target.files[0]
      if (!file) { return }
      const reader = new FileReader()

      reader.onload = e => {
        this.$emit("upload-data", e.target.result)
        this.showUploadBlock = false
      }
      reader.readAsText(file)
    },
    l10nGetMsg (...params) {
      return L10n.l10NGetMsg(...params)
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-app-menu__buttons,
  .alpheios-alignment-app-menu__upload-block {
    padding: 15px 15px 0;
    text-align: left;
  }
</style>