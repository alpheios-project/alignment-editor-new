<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part1">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">ALIGNING</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>After your text has been prepared for alignment by tokenization it appears in red.</p>
          <p>At the start of a new alignment all the words will be red.</p>
          <p>To align words in the original text with those in translations, first click on the word or words in the original 
            that you want to link to some word or words in the translation, they will turn green to indicate that an alignment is in progress.
          </p>
          <p>Then select the words in the translation that you wish to align with the words in the original. They will turn amber as you click on them.</p>
          <p class="alpheios-editor-help-content-text__image"><img :src="state.createAlGroupPNG" /></p>
          <p>To save the alignment link you must now return to the original text and click on any of the words highlighted in green. 
            All the words in the alignment in both boxes will then turn black and the alignment link will be established.
          </p>
          <p>Now mousing over any of the words in the link will highlight the whole alignment in both the original and the translation.</p>
          <p class="alpheios-editor-help-content-text__close-link" @click="state.partVisible = false">Close</p>
      </div>
  </div>
</template>
<script setup>
import createAlGroupPNG from '@/_images/create-al-group.png'
import PlusIcon from '@/inline-icons/plus.svg'

import { reactive } from 'vue'

const state = reactive({
  partVisible: false,

  createAlGroupPNG: createAlGroupPNG
})
</script>

<style lang="scss">
</style>