<template>
  <div id="alpheios-main-menu">
    <div class="alpheios-alignment-app-menu" :class="{ 'alpheios-shown': state.menuShown }">
      <span class="alpheios-alignment-app-menu-close-icon" @click = "closeMenu">
        <x-close-icon />
      </span>

      <select-views @updateViewType = "updateViewType" :inHeader = "false" :allViewTypes = "props.allViewTypes" />

      <div class="alpheios-alignment-app-menu__buttons" :class="{ 'alpheios-alignment-menu-only-filter': props.onlyFilter }">

        <text-filter-block v-for="view in allViewsNames" :key="view"
            @changeOrder = "changeOrder" @updateVisibility = "updateVisibility" 
            :view = "view" v-show = "props.currentView === view"/>
      </div>
    </div>
    <div class="alpheios-app-black-screen" v-show="state.menuShown"></div>
  </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import XCloseIcon from '@/inline-icons/xclose.svg'
import Tooltip from '@/vue/common/tooltip.vue'

import TextFilterBlock from '@/_output/vue/text-filter-block.vue'
import SelectViews from '@/_output/vue/select-views.vue'

import { computed, inject, reactive, onMounted, watch, ref, nextTick } from 'vue'

const l10n = computed(() => { return L10nSingleton })

const emit = defineEmits([ 'changeOrder', 'updateVisibility', 'updateViewType' ])

const props = defineProps({
  menuShow: {
    type: Number,
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
})

const state = reactive({
  menuShown: false
})

watch(
  () => props.menuShow,
  () => { state.menuShown = true }
)

const allViewsNames = computed(() => {
  return props.allViewTypes.map(item => item.value)
})

const closeMenu = () => {
  state.menuShown = false
}

const changeOrder = (data) => {
  emit('changeOrder', data)
}

const updateVisibility = (data) => {
  emit('updateVisibility', data)
}

const updateViewType = (data) => {
  emit('updateViewType', data)
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
