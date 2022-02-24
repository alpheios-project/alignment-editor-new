<template>
  <div id="alpheios-main-menu">
    <div class="alpheios-alignment-app-menu" :class="{ 'alpheios-shown': menuShown }">
      <span class="alpheios-alignment-app-menu-close-icon" @click = "closeMenu">
        <x-close-icon />
      </span>

      <div class="alpheios-alignment-app-menu__buttons">
        <text-filter-block :fullData="fullData" 
            @changeOrder = "changeOrder" @updateVisibility = "updateVisibility"  />
      </div>
    </div>
    <div class="alpheios-app-black-screen" v-show="menuShown"></div>
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import XCloseIcon from '@/inline-icons/x-close.svg'
import Tooltip from '@/vue/common/tooltip.vue'

import TextFilterBlock from '@/_output/vue/text-filter-block.vue'

export default {
  name: 'MainMenu',
  components: {
    textFilterBlock: TextFilterBlock,
    xCloseIcon: XCloseIcon,
    tooltip: Tooltip
  },
  props: {
    menuShow: {
      type: Number,
      required: true
    },
    fullData: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      menuShown: false
    }
  },
  watch: {
    menuShow () {
      this.menuShown = true
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    }
  },
  methods: {
    closeMenu () {
      this.menuShown = false
    },
    changeOrder (langList) {
      this.$emit('changeOrder', langList)
    },
    updateVisibility (langData) {
      this.$emit('updateVisibility', langData)
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-app-menu {
      height: 100%; 
      width: 280px; 
      position: fixed; 
      z-index: 10000;
      top: 0; 
      left: -280px;
      background-color: #e0e0e0; 
      overflow-x: hidden; 
       
      transition: left 0.5s; 

      &.alpheios-shown {
        left: 0;
      }

      .alpheios-alignment-app-menu__buttons {
        padding: 70px 20px 10px;
      }
      .alpheios-alignment-app-menu-close-icon {
        display: block;
        position: absolute;
        top: 25px;
        right: 25px;
        width: 25px;
        height: 25px;
        cursor: pointer;

        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      }
  }
</style>
