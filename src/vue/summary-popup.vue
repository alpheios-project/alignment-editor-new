<template>
    <modal v-if="showModal" @close="$emit('closeModal')">
        <template v-slot:header>
            Alpheios believes your texts are in the following languages. Please review and correct if necessary
        </template>

        <template v-slot:body v-if="contentAvailable">
          <waiting v-show="showWaiting" />
        </template>

        <template v-slot:footer>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click = "startAlign">All OK</button>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="$emit('closeModal')">Cancel</button>
        </template>
    </modal>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Modal from '@/vue/common/modal.vue'
import Waiting from '@/vue/common/waiting.vue'

export default {
  name: 'SummaryPopup',
  components: {
    modal: Modal,
    waiting: Waiting
  },
  props: {
    showModal: {
    type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      contentAvailable: true,
      showWaiting: true
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
  },
  methods: {
    startAlign () {
      this.$emit('start-align')
    }
  }
}
</script>
<style lang="scss">
</style>