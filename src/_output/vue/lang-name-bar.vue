<template>
    <p class="alpheios-al-editor-segment-cell-target-row__bar" dir="ltr">
      <span class="alpheios-al-editor-segment-cell-target-row__metadata"
            :class = "{ 'alpheios-al-editor-segment-cell-target-row__metadata-full': showFullMetadata }"
            @click = "toggleMetadata"
            v-show = "showData"
      >{{ metadataShort }}</span>
      <span class="alpheios-al-editor-segment-cell-target-row__langname" v-show = "showData">{{ langName }}</span>
    </p>
</template>
<script>
import Vue from '@vue-runtime'
export default {
  name: 'LangNameBar',
  props: {
    langName: {
      type: String,
      required: true
    },
    metadataShort: {
      type: String,
      required: false,
      default: ''
    },
    showData: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data () {
    return {
      showFullMetadata: false
    }
  },
  methods: {
    /**
     * Show/hide full metadata and emits an event to adapt padding-top for the cell
     */
    async toggleMetadata () {
      this.showFullMetadata = !this.showFullMetadata
      await Vue.nextTick()
      this.$emit('updateMetadataHeight', this.$el.clientHeight)
    }
  }
}
</script>
<style lang="scss">
    .alpheios-al-editor-segment-cell-target-row__bar {
        margin: 0;
        display: inline-block;
        position: absolute;
        min-height: 2px;

        overflow-y: hidden;
        border-bottom: 0;
        top: 0;
        right: 0;
        left: 0;
        margin: 0;
        padding: 0;
        
        padding: 0px;
        font-size: 90%;

        background: #185F6D;
        color: #fff;
        z-index: 100;

        .alpheios-al-editor-segment-cell-target-row__metadata {
          display: inline-block;
          white-space: nowrap;
          text-overflow: ellipsis;
          width: calc(100% - 210px);
          cursor: pointer;
          text-align: left;
          vertical-align: top;
          overflow: hidden;
          padding: 5px;

          &.alpheios-al-editor-segment-cell-target-row__metadata-full {
            white-space: initial;
          }
        }

        .alpheios-al-editor-segment-cell-target-row__langname {
          display: inline-block;
          width: 160px;
          text-align: right;
          vertical-align: top;
          padding: 5px;
        }
    }
</style>