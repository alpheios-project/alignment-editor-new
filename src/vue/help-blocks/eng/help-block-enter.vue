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
    helpEnterPart9: HelpEnterPart9
  },
  data () {
    return {
    }
  }
}
</script>
<style lang="scss">

</style>


