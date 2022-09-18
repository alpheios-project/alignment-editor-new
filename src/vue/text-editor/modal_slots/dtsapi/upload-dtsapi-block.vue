<template>  
  <modal-base :modalName="modalName" :draggable="true" height="auto" :shiftY="0.3" :clickToClose="!state.showWaitingUpload" > 
    <div class="alpheios-alignment-editor-modal-dts-api" data-alpheios-ignore="all">
      <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click = "$modal.hide('dtsapi')">
              <x-close-icon />
          </span>

          <p class="alpheios-editor-content-title">{{ l10n.getMsgS('UPLOAD_DTSAPI_TITLE') }}</p>
          <ul class="alpheios-editor-content-breadcrumbs" v-show="showBreadcrumbs">
            <li v-for="(crumb, crumbIndex) in state.breadcrumbs" :key="crumbIndex" 
                :class = "crumbClass(crumb)"
                @click = "clickCrumb(crumb, crumbIndex)"
            >
              {{ crumb.title }}
            </li>
          </ul>
      </div>
        
      <div class="alpheios-modal-body" v-if="contentAvailable">
          <waiting v-show="state.showWaiting" />
          <div class = "alpheios-editor-content-description" v-show="showDescription">
            <p class = "alpheios-editor-content-description__title" 
               @click = "state.showDescriptionDetails = !state.showDescriptionDetails">
               {{ l10n.getMsgS('UPLOAD_DTSAPI_DESCRIPTION_TITLE')  }} 
            </p>
            <div v-show = "state.showDescriptionDetails" class = "alpheios-editor-content-description__details" 
                 v-html="l10n.getMsgS('UPLOAD_DTSAPI_DESCRIPTION_DETAILS') "></div>
          </div>

          <dts-api-pagination v-if="state.pagination" v-show="!state.showWaiting"
            :first = "state.pagination.first"  :previous = "state.pagination.previous"
            :last = "state.pagination.last"    :next = "state.pagination.next"
            :current = "state.pagination.current"
            @getPage = "getPage"
          />

          <div v-if="showEntireDocument" class="alpheios-editor-content-link" v-show="!state.showWaiting">
            <span class="alpheios-editor-content-link__text" @click = "getEntireDocument">
              {{ l10n.getMsgS("UPLOAD_DTSAPI_ENTIRE_DOCUMENT") }}</span>
          </div>
          <ul class="alpheios-editor-content-list" :class = "cssClasses" v-show="!state.showWaiting">
            <li class="alpheios-editor-content-link"
              v-for = "(linkData, linkIndex) in state.content" :key = "linkIndex"
            >
              <span v-if="linkData.type === 'collection'" class="alpheios-editor-content-link__text" 
                    @click = "getCollection(linkData)" v-html="linkData.title"></span>
              <span v-if="linkData.type === 'resource'" class="alpheios-editor-content-link__text" 
                    @click = "getNavigation(linkData)" v-html="linkData.title"></span>
              
              <span v-if="linkData.type === 'document'" class="alpheios-editor-content-link__checkbox">
                <input type="checkbox" :id="contentRefId(linkIndex)" :value="linkIndex" v-model="state.checkedRefs">
                <label :for="contentRefId(linkIndex)">{{ linkData.ref }}</label>
              </span>
            </li>
          </ul>
      </div>

      <div class="alpheios-modal-footer">
          <button class="alpheios-editor-button-tertiary alpheios-modal-button" 
                  @click = "getDocument" :disabled="uploadButtonDisabled">Upload</button>
          <button class="alpheios-editor-button-tertiary alpheios-modal-button" 
                  @click="closeModal" :disabled="state.showWaiting">Cancel</button>
      </div>
    </div>
  </modal-base>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import UploadController from '@/lib/controllers/upload-controller.js'
import UploadDTSAPI from '@/lib/upload/upload-dts-api.js'

import DtsApiPagination from '@/vue/text-editor/modal_slots/dtsapi/dts-api-pagination.vue'
import Waiting from '@/vue/common/waiting.vue'
import XCloseIcon from '@/inline-icons/xclose.svg'

import { computed, inject, reactive, onMounted } from 'vue'
const emit = defineEmits([ 'uploadFromDTSAPI' ])

const l10n = computed(() => { return L10nSingleton })

const $modal = inject('$modal')

const props = defineProps({
  modalName: {
    type: String,
    required: true
  }
})

const state = reactive({
  homeLinks: [],
  content: [],
  pagination: null,
  contentUpdated: 1,
  showWaiting: false,
  breadcrumbs: [],
  checkedRefs: [],
  showDescriptionDetails: false
})

onMounted(() => {
  state.homeLinks = UploadDTSAPI.rootCollections
    
  state.breadcrumbs.push({ title: 'Home' })
  updateContent(state.homeLinks, false)
})

const contentAvailable = computed(() => {
  return state.contentUpdated && Boolean(state.content) 
})

const cssClasses = computed(() => {
  return {
    'alpheios-editor-content-list__col2': state.content.length <= 20,
    'alpheios-editor-content-list__col4': state.content.length > 20
  }
})

const uploadButtonDisabled = computed(() => {
  return state.contentUpdated && ((state.content.length === 0) || 
         ((state.content.length > 0) && (state.content[0].type === 'Collection')) || (state.checkedRefs.length === 0))
})

const showBreadcrumbs = computed(() => {
  return state.breadcrumbs.length > 1
})

const showDescription = computed(() => {
  return !state.showWaiting && contentAvailable.value && (state.content.length > 0) && (state.content[0].type === 'document') 
})

const showEntireDocument = computed(() => {
  return state.content && (state.content.length > 0) && (state.content[0].type === 'document')
})

const crumbClass = (crumb) => {
  return {
    'alpheios-editor-content-breadcrumbs__link': (Boolean(crumb.content) && crumb.content.length > 0) || (Boolean(crumb.content && crumb.content.links) && crumb.content.links.length > 0)
  }
}

const contentRefId = (refIndex) => {
  return `alpheios-editor-content-link-ref-${refIndex}`
}

const clickCrumb = (crumb, crumbIndex) => {
  clearContent(false)

  updateContent(crumb.content)

  state.breadcrumbs.splice(crumbIndex + 1)
  crumb.content = undefined
}

const clearContent = (showWaiting = true) => {
  state.content = []
  state.checkedRefs = []
  state.contentUpdated++
  state.showWaiting = showWaiting
}

const updateContent = (content = null, showWaiting = false) => {
  if (content) {
    const finalContent = content.links ? content.links : content
    state.content.splice(0, state.content.length)
    state.content.push(...finalContent)

    state.pagination = content.pagination ?  Object.assign({}, state.pagination, content.pagination) : null
  }

  state.showWaiting = showWaiting
  state.contentUpdated++
}

const updateBreadcrumbs = (linkData) => {
  if (linkData.title) {
    let contentData = {
      links: state.content,
      pagination: state.pagination
    }

    state.breadcrumbs[state.breadcrumbs.length - 1].content = contentData
    state.breadcrumbs.push({ title: linkData.title, page: linkData.page })
  }
}

const getCollection = async (linkData) => {     
  updateBreadcrumbs(linkData)
  clearContent()
  const content = await UploadController.upload('dtsAPIUpload', {linkData, objType: 'collection'})
  updateContent(content)
}

const getNavigation = async (linkData) => {     
  updateBreadcrumbs(linkData)
  clearContent()
  
  const content = await UploadController.upload('dtsAPIUpload', {linkData, objType: 'navigation'})
  updateContent(content)
}

const defineRefParams = () => {
  let refParams = {}

  if (state.checkedRefs.length === 1) {
    refParams = { ref: state.content[state.checkedRefs[0]].ref }
  } else {
    state.checkedRefs.sort((a, b) => a-b)
    refParams = { start: state.content[state.checkedRefs[0]].ref, end: state.content[state.checkedRefs[state.checkedRefs.length-1]].ref }
  }
  return refParams
}

const getDocument = async () => {
  const linkData = state.content[state.checkedRefs[0]]

  const refParams = defineRefParams()     
  state.showWaiting = true

  const result = await UploadController.upload('dtsAPIUpload', {linkData, objType: 'document', refParams})

  state.showWaiting = false
  if (result) {
    state.checkedRefs.splice(0, state.checkedRefs.length)

    emit('uploadFromDTSAPI', result)
    $modal.hide(props.modalName)
    return true
  }
}

const getEntireDocument = async () => {
  const linkData = state.content[0]
  state.showWaiting = true

  const result = await UploadController.upload('dtsAPIUpload', {linkData, objType: 'document'})

  state.showWaiting = false
  
  if (result) {
    emit('uploadFromDTSAPI', result)
    $modal.hide(props.modalName)
    return true
  }
}

const closeModal = () => {
  state.checkedRefs.splice(0, state.checkedRefs.length)
  $modal.hide(props.modalName)
}

const getPage = async (pageNum) => {
  const linkData = {
    id: state.pagination.id,
    baseUrl: state.pagination.baseUrl,
    page: pageNum
  }
  updateBreadcrumbs(linkData)
  clearContent()
  const content = await UploadController.upload('dtsAPIUpload', {linkData, objType: 'collection'})
  updateContent(content)
}

</script>


<style lang="scss">
.alpheios-alignment-editor-actions-menu 
  p.alpheios-editor-content-title {
    margin: 0;
  }

.alpheios-editor-content-title {
    font-weight: bold;
    padding: 0 0 5px 0;
    border-bottom: 2px solid #ddd;
}
.alpheios-editor-content-list {
  column-count: 2;
  list-style-type: none;
  margin: 0;
  padding: 0;

  &.alpheios-editor-content-list__col2 {
    column-count: 2;
  }
  &.alpheios-editor-content-list__col4 {
    column-count: 4;
  }
}
.alpheios-editor-content-link {
  cursor: pointer;
  display: inline-block;
  width: 100%;
  padding-bottom: 20px;

  .alpheios-editor-content-link__text {
    text-decoration: underline;
    display: inline-block;
    width: 100%;
  }

  .alpheios-editor-content-link__checkbox {
    display: inline-block;
    width: 90%;
  }
}

.alpheios-editor-content-breadcrumbs {
  margin: 0 0 20px 0;
  padding: 0;

  li {
    display: inline-block;
    padding: 5px 5px 5px 0;
    &:after {
      content: ' > '
    }

    &:last-child {
      &:after {
        content: ''
      }
    }

    &.alpheios-editor-content-breadcrumbs__link {
      cursor: pointer;
      text-decoration: underline;
      color: #185F6D;
    }
  }
}

.alpheios-editor-content-description {
  p.alpheios-editor-content-description__title {
    text-decoration: underline;
    color: #185F6D;
    margin: 0 0 10px 0;
    cursor: pointer;
  }

  .alpheios-editor-content-description__details {
    margin: 0 0 10px;
    padding: 0 20px 0;
    border-bottom: 2px solid #ddd;
  }
}

.alpheios-alignment-editor-modal-dts-api {
  .alpheios-modal-body {
      max-height: 370px;
  }
}
</style>