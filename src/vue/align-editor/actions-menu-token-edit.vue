<template>
    <div class="alpheios-token-edit-actions" v-show="token"
         :style = "cssStyles"
    >
      <div class="alpheios-token-edit-actions-inner" ref="actionsInner">
        <span class="alpheios-token-edit-actions-button" id="alpheios-token-edit-actions-button__update-token">A</span>
        <span class="alpheios-token-edit-actions-button" id="alpheios-token-edit-actions-button__merge-left">B</span>
        <span class="alpheios-token-edit-actions-button" id="alpheios-token-edit-actions-button__merge-right">C</span>
        <span class="alpheios-token-edit-actions-button" id="alpheios-token-edit-actions-button__split">D</span>
      </div>
    </div>
</template>
<script>
export default {
  name: 'ActionsMenuTokenEdit',
  props: {
    token: {
      type: Object,
      required: false
    },
    leftPos: {
      type: Number,
      required: false,
      default: 0
    },
    topPos: {
      type: Number,
      required: false,
      default: 0
    },
    containerWidth: {
      type: Number,
      required: false,
      default: 0
    }
  },
  data () {
    return {
    }
  },
  computed: {
    cssStyles () {
      const  top = this.topPos + 'px'
      const menuWidth = this.$refs.actionsInner ? this.$refs.actionsInner.offsetWidth : 0

      if ((this.leftPos + menuWidth + 20) > this.containerWidth) {
        return { 
          right: '0px',
          top
        }
      } else {
        return { 
          left: (this.leftPos - 10) + 'px',
          top
        }
      }
    }
  }
}
</script>
<style lang="scss">
  .alpheios-token-edit-actions {
    display: inline-block;
    padding: 0 10px;

    position: absolute;
    top: -10px;
    z-index: 1000;
  }

  .alpheios-token-edit-actions-button {
    display: inline-block;
    margin: 0 2px;
    width: 20px;
    height: 20px;
    vertical-align: center;
    border: 1px solid;
    border-radius: 20px;
    cursor: pointer;
    text-align: center;
    line-height: 20px;
  }
</style>
