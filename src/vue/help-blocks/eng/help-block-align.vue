<template>
  <div class="alpheios-editor-help-content-container" data-alpheios-ignore="all">
    <help-align-part1 />
    <help-align-part2 />
    <help-align-part3 />
    <help-align-part4 />
    <help-align-part5 />
    <help-align-part6 />
    <help-align-part7 />
    <help-align-part8 />
    <help-align-part9 />
    <help-align-part10 />
    <help-align-part11 />
    <help-align-part12 />
    <help-align-part13 />
    <help-align-part14 />
  </div>
</template>
<script>
import HelpAlignPart1 from '@/vue/help-blocks/eng/help-align-parts/help-align-part1.vue'
import HelpAlignPart2 from '@/vue/help-blocks/eng/help-align-parts/help-align-part2.vue'
import HelpAlignPart3 from '@/vue/help-blocks/eng/help-align-parts/help-align-part3.vue'
import HelpAlignPart4 from '@/vue/help-blocks/eng/help-align-parts/help-align-part4.vue'
import HelpAlignPart5 from '@/vue/help-blocks/eng/help-align-parts/help-align-part5.vue'
import HelpAlignPart6 from '@/vue/help-blocks/eng/help-align-parts/help-align-part6.vue'
import HelpAlignPart7 from '@/vue/help-blocks/eng/help-align-parts/help-align-part7.vue'
import HelpAlignPart8 from '@/vue/help-blocks/eng/help-align-parts/help-align-part8.vue'
import HelpAlignPart9 from '@/vue/help-blocks/eng/help-align-parts/help-align-part9.vue'
import HelpAlignPart10 from '@/vue/help-blocks/eng/help-align-parts/help-align-part10.vue'
import HelpAlignPart11 from '@/vue/help-blocks/eng/help-align-parts/help-align-part11.vue'
import HelpAlignPart12 from '@/vue/help-blocks/eng/help-align-parts/help-align-part12.vue'
import HelpAlignPart13 from '@/vue/help-blocks/eng/help-align-parts/help-align-part13.vue'
import HelpAlignPart14 from '@/vue/help-blocks/eng/help-align-parts/help-align-part14.vue'

export default {
  name: 'HelpBlockAlign',
  components: {
    helpAlignPart1: HelpAlignPart1,
    helpAlignPart2: HelpAlignPart2,
    helpAlignPart3: HelpAlignPart3,
    helpAlignPart4: HelpAlignPart4,
    helpAlignPart5: HelpAlignPart5,
    helpAlignPart6: HelpAlignPart6,
    helpAlignPart7: HelpAlignPart7,
    helpAlignPart8: HelpAlignPart8,
    helpAlignPart9: HelpAlignPart9,
    helpAlignPart10: HelpAlignPart10,
    helpAlignPart11: HelpAlignPart11,
    helpAlignPart12: HelpAlignPart12,
    helpAlignPart13: HelpAlignPart13,
    helpAlignPart14: HelpAlignPart14
  }
}
</script>
<style lang="scss">
  .alpheios-editor-help-content{
      &.alpheios-editor-help-align-content-part4,
      &.alpheios-editor-help-align-content-part11 {
        margin-top: 25px;
      }
  }

  .alpheios-editor-help-content {
      &.alpheios-editor-help-align-content-part12,
      &.alpheios-editor-help-align-content-part13,
      &.alpheios-editor-help-align-content-part14 {
        padding-left: 20px;
      }
  }
</style>
