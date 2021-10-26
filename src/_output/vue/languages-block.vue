<template>
    <div class="alpheios-al-editor-languages-block">
      <draggable
        :list="languagesList"
        class="alpheios-al-editor-languages-list"
        ghost-class="ghost"
        @start="dragging = true"
        @end="endDrag"
      >
        <div
          v-for="(langData, langIndex) in languagesList"
          :key="langIndex"
          :class="langClasses(langData)"
          @click = "toggleLangDataVisibility(langData)"
        >
          {{ langData.langName }}

          <span class="alpheios-icon-button alpheios-al-editor-languages-hide alpheios-icon-button__inactive" v-show="langData.hidden">
            <hide-icon />
          </span>
          <span class="alpheios-icon-button alpheios-al-editor-languages-show" v-show="!langData.hidden">
            <show-icon />
          </span>
        </div>
      </draggable>
    </div>
</template>
<script>
import ShowIcon from '@/_output/inline-icons/show.svg'
import HideIcon from '@/_output/inline-icons/hide.svg'

import Draggable from '@vuedraggable'
import GroupUtility from '@/_output/utility/group-utility.js'

export default {
  name: 'LanguagesBlock',
  components: {
    draggable: Draggable,
    hideIcon: HideIcon,
    showIcon: ShowIcon
  },
  props: {
    fullData: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      languagesList: [],
      dragging: false
    }
  },
  created() {
    this.languagesList = GroupUtility.allLanguagesTargets(this.fullData)
  },
  methods: {
    endDrag (e) {
      this.dragging = false
      if (e.oldDraggableIndex !== e.newDraggableIndex) {
        const langsList = this.languagesList.map(langData => langData.targetId)
        this.$emit('changeLanguageOrder', langsList)
      }
    },

    langClasses (langData) {
      return {
        'alpheios-al-editor-languages-list-item': true,
        'alpheios-al-editor-languages-list-item__inactive': langData.hidden
      }
    },

    toggleLangDataVisibility (langData) {
      langData.hidden = !langData.hidden
      this.$emit('updateVisibility', langData)
    }
  }
}
</script>
<style lang="scss">
  .alpheios-al-editor-languages-list {
    padding: 5px 10px;
  }

  .alpheios-al-editor-languages-list-item {
    display: inline-block;
    border: 1px solid #ddd;
    background: #fff;
    padding: 5px 10px;
    cursor: pointer;
  }

  .alpheios-icon-button {
    display: inline-block;
    width: 20px;
    height: 20px;
    line-height: 20px;
    padding: 0 5px;
  }
</style>
