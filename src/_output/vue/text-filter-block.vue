<template>
    <div class="alpheios-al-editor-languages-block" :class="viewClass">
      <draggable
        :list="identList"
        class="alpheios-al-editor-languages-list"
        ghost-class="ghost"
        @start="dragging = true"
        @end="endDrag"
      >
        <div
          v-for="identData in identList"
          :key="identData.targetId"
          :class="identClasses(identData)"
          @click = "toggleIdentDataVisibility(identData)"
        >
          {{ identData.identName }}

        </div>
      </draggable>
    </div>
</template>
<script>
import Draggable from '@vuedraggable'
import GroupUtility from '@/_output/utility/group-utility.js'

export default {
  name: 'LanguagesBlock',
  components: {
    draggable: Draggable
  },
  props: {
    fullData: {
      type: Object,
      required: true
    },
    view: {
      type: String,
      required: false,
      default: 'horizontal'
    }
  },
  data () {
    return {
      identList: [],
      dragging: false
    }
  },
  created() {
    this.identList = GroupUtility.allIdentificationTargets(this.fullData)
  },
  computed: {
    avaliableIdents () {
      return this.identList.filter(identDataItem => !identDataItem.hidden).length
    },
    identFilteringAvailable () {
      return this.avaliableIdents > 1
    },
    viewClass () {
      return `alpheios-al-editor-languages-block-${this.view}`
    }

  },
  methods: {
    endDrag (e) {
      this.dragging = false
      if (e.oldDraggableIndex !== e.newDraggableIndex) {
        const identsList = this.identList.map(identData => identData.targetId)
        this.$emit('changeOrder', identsList)
      }
    },

    identClasses (identData) {
      return {
        'alpheios-al-editor-languages-list-item': true,
        'alpheios-al-editor-languages-list-item-clickable': this.identFilteringAvailable || identData.hidden,
        'alpheios-al-editor-languages-list-item__inactive': identData.hidden
      }
    },

    toggleIdentDataVisibility (identData) {
      if (this.identFilteringAvailable || identData.hidden) {
        identData.hidden = !identData.hidden
        this.$emit('updateVisibility', identData)
      }
    }
  }
}
</script>
<style lang="scss">
  .alpheios-al-editor-languages-list {
    // padding: 5px 10px;
  }

  .alpheios-al-editor-languages-list-item {
    display: inline-block;
    border: 1px solid #ddd;
    background: #fff;
    padding: 5px 10px;
    

    &.alpheios-al-editor-languages-list-item-clickable {
      cursor: pointer;
    }
  }

  .alpheios-icon-button {
    display: inline-block;
    width: 20px;
    height: 20px;
    line-height: 20px;
    padding: 0 5px;
  }

  .alpheios-al-editor-languages-block-horizontal {
    .alpheios-al-editor-languages-list-item {
      display: block;
    }
  }
</style>
