<template>
    <span class="alpheios-token-edit alpheios-alignment-token-edit-span" :class="additionalClasses">
      {{ token.beforeWord }}
      <span class="alpheios-alignment-token-edit-input-container">
        <span class="alpheios-alignment-token-edit-input-width-machine" aria-hidden="true">{{ tokenWord }}</span>
        <input
            class="alpheios-alignment-input alpheios-alignment-token-edit-input"
            type="text"
            v-model="tokenWord"
            :id="itemId"
            @focus = "showActionsMenu"
        >
      </span>
      {{ token.afterWord }}
    </span>
</template>
<script>
import Vue from '@vue-runtime'

export default {
  name: 'TokenEditBlock',
  props: {
    token: {
      type: Object,
      required: true
    },
    deactivated : {
      type: Number,
      required: false,
      default: 0
    },
    updateTokenIdWord : {
      type: String,
      required: false,
      default: null
    },
    mergeTokenLeftIdWord : {
      type: String,
      required: false,
      default: null
    },
    mergeTokenRightIdWord : {
      type: String,
      required: false,
      default: null
    },
    splitTokenIdWord : {
      type: String,
      required: false,
      default: null
    }
  },
  data () {
    return {
      tokenWord: null,
      activated: false
    }
  },
  watch: {
    '$store.state.tokenUpdated' () {
      this.tokenWord = this.token.word
    },
    deactivated () {
      this.activated = false
    },
    updateTokenIdWord () {
      if (this.activated && (this.updateTokenIdWord === this.token.idWord)) {
        this.updateTokenWord()
      }
    },
    mergeTokenLeftIdWord () {
      if (this.activated && (this.mergeTokenLeftIdWord === this.token.idWord)) {
        this.mergeToken('left')
      }
    },
    mergeTokenRightIdWord () {
      if (this.activated && (this.mergeTokenRightIdWord === this.token.idWord)) {
        this.mergeToken('right')
      }
    },
    splitTokenIdWord () {
      if (this.activated && (this.splitTokenIdWord === this.token.idWord)) {
        this.splitToken()
      }
    } 
  },
  mounted () {
    this.tokenWord = this.token.word
  },
  computed: {
    itemId () {
      return `${this.token.idWord}-input-id`
    },
    additionalClasses () {
      return {
        'alpheios-alignment-token-edit-span__activated' : this.activated
      }
    }
  },
  methods: {
    updateTokenWord () {
      this.$alignedC.updateTokenWord(this.token, this.tokenWord)
    },
    mergeToken (direction) {
      this.$alignedC.mergeToken(this.token, direction)
      this.hideActionsMenu()
    },
    splitToken ()  {
      this.$alignedC.splitToken(this.token, this.tokenWord)
    },
    hideActionsMenu () {
      this.activated = false
      this.$emit('hideActionsMenu')
    },
    async showActionsMenu () {
      this.$emit('removeAllActivated')

      await Vue.nextTick()

      this.activated = true
      this.$emit('showActionsMenu', {
        token: this.token,
        leftPos: this.$el.offsetLeft,
        topPos: this.$el.offsetTop
      })
    }
  } 
}
</script>
<style lang="scss">
  .alpheios-alignment-token-edit-span {
    display: inline-block;
    vertical-align: baseline;
    padding: 4px;
    position: relative;
  }

  .alpheios-alignment-token-edit-input-width-machine {
    display: inline-block;
    vertical-align: baseline;
    padding: 8px;
  }
 
  .alpheios-alignment-token-edit-input-container {
    display: inline-block;
    position: relative;
    padding: 4px;
  }

  .alpheios-alignment-token-edit-input {
    position: absolute;
    width: 100%;
    left: 0;
  }

  .alpheios-alignment-token-edit-span__activated {
    margin-top: 30px;
  }

</style>