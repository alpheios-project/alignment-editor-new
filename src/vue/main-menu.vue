<template>
  <div class="alpheios-alignment-app-menu">
      <div class="alpheios-alignment-app-menu__buttons">
        <button class="alpheios-button-tertiary" @click="$emit('download-data')" >Download</button>
        <button class="alpheios-button-tertiary" @click="uploadTexts" >Upload</button>
        <button class="alpheios-button-tertiary" @click="$emit('align-texts')" >Align</button>
      </div>
      <div class="alpheios-alignment-app-menu__upload-block" v-show="showUploadBlock">
        <input type="file" @change="loadTextFromFile">
      </div>
  </div>
</template>
<script>
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