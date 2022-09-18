<template>
  <div class="alpheios-editor-help-content-container">
      <help-enter-part1 />
      <help-enter-part2 />

      <help-enter-part3 />
      <help-enter-part4 />
      <help-enter-part5 />
      <help-enter-part6 />

      <help-enter-part7 />
      <help-enter-part8 />
      <help-enter-part9 />

      <help-enter-part10 />

      <h4 class="alpheios-editor-help-content-title alpheios-editor-help-content-title-outside alpheios-editor-help-content-title-outside__padding" >ACADEMIC OPTIONS</h4>
      <help-enter-part11 />
      <help-enter-part12 />
      <help-enter-part13 />

      <h4 class="alpheios-editor-help-content-title alpheios-editor-help-content-title-outside alpheios-editor-help-content-title-outside__padding" >ADVANCED OPTIONS</h4>
      <help-enter-part14 />
      <help-enter-part15 />
      <help-enter-part16 />
  </div>
</template>
<script>
import HelpEnterPart1 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part1.vue'
import HelpEnterPart2 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part2.vue'
import HelpEnterPart3 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part3.vue'
import HelpEnterPart4 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part4.vue'
import HelpEnterPart5 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part5.vue'
import HelpEnterPart6 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part6.vue'
import HelpEnterPart7 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part7.vue'
import HelpEnterPart8 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part8.vue'
import HelpEnterPart9 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part9.vue'
import HelpEnterPart10 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part10.vue'
import HelpEnterPart11 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part11.vue'
import HelpEnterPart12 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part12.vue'
import HelpEnterPart13 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part13.vue'
import HelpEnterPart14 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part14.vue'
import HelpEnterPart15 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part15.vue'
import HelpEnterPart16 from '@/vue/help-blocks/eng/help-enter-parts/help-enter-part16.vue'

export default {
  name: 'HelpBlockEnter',
  components: {
    helpEnterPart1: HelpEnterPart1,
    helpEnterPart2: HelpEnterPart2,
    helpEnterPart3: HelpEnterPart3,
    helpEnterPart4: HelpEnterPart4,
    helpEnterPart5: HelpEnterPart5,
    helpEnterPart6: HelpEnterPart6,
    helpEnterPart7: HelpEnterPart7,
    helpEnterPart8: HelpEnterPart8,
    helpEnterPart9: HelpEnterPart9,
    helpEnterPart10: HelpEnterPart10,
    helpEnterPart11: HelpEnterPart11,
    helpEnterPart12: HelpEnterPart12,
    helpEnterPart13: HelpEnterPart13,
    helpEnterPart14: HelpEnterPart14,
    helpEnterPart15: HelpEnterPart15,
    helpEnterPart16: HelpEnterPart16
  },
  data () {
    return {
    }
  }
}
</script>
<style lang="scss">
  .alpheios-editor-help-content{
      &.alpheios-editor-help-enter-content-part3,
      &.alpheios-editor-help-enter-content-part7,
      &.alpheios-editor-help-enter-content-part10 {
        margin-top: 25px;
      }
  }


  h4.alpheios-editor-help-content-title.alpheios-editor-help-content-title-outside {
    margin: 10px 0 10px;
    color: #185F6D;
  }

  .alpheios-editor-help-content-title-outside__padding {
    padding-left:20px;
  }
  .alpheios-editor-help-content {
      &.alpheios-editor-help-enter-content-part11,
      &.alpheios-editor-help-enter-content-part12,
      &.alpheios-editor-help-enter-content-part13,
      &.alpheios-editor-help-enter-content-part14,
      &.alpheios-editor-help-enter-content-part15,
      &.alpheios-editor-help-enter-content-part16 {
        padding-left: 40px;
      }
  }
</style>


