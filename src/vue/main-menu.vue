<template>
  <div class="alpheios-alignment-app-menu">
      <div class="alpheios-alignment-app-menu__buttons">
        <button class="alpheios-button-tertiary" @click="$emit('download-data')" >{{ l10n.getMsgS('MAIN_MENU_DOWNLOAD_TITLE') }}</button>
        <button class="alpheios-button-tertiary" @click="uploadTexts" >{{ l10n.getMsgS('MAIN_MENU_UPLOAD_TITLE') }}</button>
        <button class="alpheios-button-tertiary" @click="$emit('align-texts')" >{{ l10n.getMsgS('MAIN_MENU_ALIGN_TITLE') }}</button>
      </div>
      <div class="alpheios-alignment-app-menu__upload-block" v-show="showUploadBlock">
        <input type="file" @change="loadTextFromFile">
      </div>
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'MainMenu',
  data () {
    return {
      showUploadBlock: false
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
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