<template>
    <span class="alpheios-alignment-token-edit-span">{{ token.beforeWord }}

      <span class="alpheios-alignment-token-edit-input-container">
        <span class="alpheios-alignment-token-edit-input-width-machine" aria-hidden="true">{{ tokenWord }}</span>
        <input
            class="alpheios-alignment-input alpheios-alignment-token-edit-input"
            type="text"
            v-model="tokenWord"
            :id="itemId"
            @change = "updateToken"
        >
      </span>

      {{ token.afterWord }}
    </span>
</template>
<script>
export default {
  name: 'TokenEditBlock',
  props: {
    token: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      tokenWord: null
    }
  },
  mounted () {
    this.tokenWord = this.token.word
  },
  computed: {
    itemId () {
      return `${this.token.idWord}-input-id`
    },
    tokenClasses () {
      return { 
      }
    }
  },
  methods: {
    updateToken () {
      console.info('Update ', this.tokenWord, this.token.word, this.token.idWord)
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-token-edit-span {
    display: inline-block;
    vertical-align: baseline;
    padding: 4px;
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


</style>