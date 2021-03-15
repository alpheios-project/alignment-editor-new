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
          class="alpheios-al-editor-languages-list-item"
          v-for="langData in languagesList"
          :key="langData.lang"
        >
          {{ langData.langName }}
        </div>
      </draggable>
    </div>
</template>
<script>
import Draggable from "@vuedraggable"
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
      const langsList = this.languagesList.map(langData => langData.targetId)
      this.$emit('changeLanguageOrder', langsList)
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
</style>
