<template>
  <div id="alpheios-main-menu">
    <div class="alpheios-alignment-app-menu" :class="{ 'alpheios-shown': menuShown }">
      <span class="alpheios-alignment-app-menu-close-icon" @click = "closeMenu">
        <x-close-icon />
      </span>
      <select-views @updateViewType = "updateViewType" :inHeader = "false" :allViewTypes = "allViewTypes" />

      <div class="alpheios-alignment-app-menu__buttons" :class="{ 'alpheios-alignment-menu-only-filter': onlyFilter }">
        <text-filter-block :fullData="fullData" v-for="view in allViewsNames" :key="view"
            @changeOrder = "changeOrder" @updateVisibility = "updateVisibility" :view = "view" v-show = "currentView === view"/>
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
import SelectViews from '@/_output/vue/select-views.vue'

export default {
  name: 'MainMenu',
  components: {
    textFilterBlock: TextFilterBlock,
    xCloseIcon: XCloseIcon,
    tooltip: Tooltip,
    selectViews: SelectViews
  },
  props: {
    menuShow: {
      type: Number,
      required: true
    },
    fullData: {
      type: Object,
      required: true
    },
    onlyFilter: {
      type: Boolean,
      required: false,
      default: true
    },
    currentView: {
      type: String,
      required: true
    },
    allViewTypes: {
      type: Array,
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
    },
    allViewsNames () {
      return this.allViewTypes.map(item => item.value)
    }
  },
  methods: {
    closeMenu () {
      this.menuShown = false
    },
    changeOrder (data) {
      this.$emit('changeOrder', data)
    },
    updateVisibility (data) {
      this.$emit('updateVisibility', data)
    },
    updateViewType (data) {
      this.$emit('updateViewType', data)
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
      // background-color: #e0e0e0; 
      // background-color: rgba(224,224,224, 0.4);

      background: rgb(224,224,224);
      background: -moz-linear-gradient(180deg, rgba(224,224,224,1) 0%, rgba(255,255,255,0.5) 100%);
      background: -webkit-linear-gradient(180deg, rgba(224,224,224,1) 0%, rgba(255,255,255,0.5) 100%);
      background: linear-gradient(180deg, rgba(224,224,224,1) 0%, rgba(255,255,255,0.5) 100%);
      filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#e0e0e0",endColorstr="#ffffff",GradientType=1);

      overflow-x: hidden; 
       
      transition: left 0.5s; 

      &.alpheios-shown {
        left: 0;
      }
      .alpheios-alignment-app-menu-close-icon {
        display: block;
        position: absolute;
        top: 20px;
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

      .alpheios-alignment-app-menu__buttons {
        padding: 20px 20px 10px;

        &.alpheios-alignment-menu-only-filter {
          padding-top: 60px;
        }
      }
</style>
