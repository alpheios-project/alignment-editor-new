<template>
    <modal :classes="classes" :name="mname"  :draggable="true" height="auto" :clickToClose="!showWaiting">
      <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click = "$emit('closeModal')">
              <x-close-icon />
          </span>

          <p class="alpheios-editor-content-title">{{ title }}</p>
          <ul class="alpheios-editor-content-breadcrumbs" v-show="showBreadcrumbs">
            <li v-for="(crumb, crumbIndex) in breadcrumbs" :key="crumbIndex" 
                :class = "crumbClass(crumb)"
                @click = "clickCrumb(crumb, crumbIndex)"
            >
              {{ crumb.title }}
            </li>
          </ul>
      </div>
        
      <div class="alpheios-modal-body" v-if="contentAvailable">
          <waiting v-show="showWaiting" />
          <div class = "alpheios-editor-content-description" v-show="showDescription">
            <p class = "alpheios-editor-content-description__title" 
               @click = "showDescriptionDetails = !showDescriptionDetails">
               {{ descriptionTitle }} 
            </p>
            <div v-show = "showDescriptionDetails" class = "alpheios-editor-content-description__details" v-html="descriptionDetails"></div>
          </div>
          
          <dts-api-pagination v-if="pagination" v-show="!showWaiting"
            :first = "pagination.first"  :previous = "pagination.previous"
            :last = "pagination.last"    :next = "pagination.next"
            :current = "pagination.current"
            @getPage = "getPage"
          />

          <div v-if="showEntireDocument" class="alpheios-editor-content-link" v-show="!showWaiting">
            <span class="alpheios-editor-content-link__text" @click = "getEntireDocument">{{ l10n.getMsgS("UPLOAD_DTSAPI_ENTIRE_DOCUMENT") }}</span>
          </div>
          <ul class="alpheios-editor-content-list" :class = "cssClasses" v-show="!showWaiting">
            <li class="alpheios-editor-content-link"
              v-for = "(linkData, linkIndex) in content" :key = "linkIndex"
            >
              <span v-if="linkData.type === 'collection'" class="alpheios-editor-content-link__text" @click = "getCollection(linkData)" v-html="linkData.title"></span>
              <span v-if="linkData.type === 'resource'" class="alpheios-editor-content-link__text" @click = "getNavigation(linkData)" v-html="linkData.title"></span>
              
              <span v-if="linkData.type === 'document'" class="alpheios-editor-content-link__checkbox">
                <input type="checkbox" :id="contentRefId(linkIndex)" :value="linkIndex" v-model="checkedRefs">
                <label :for="contentRefId(linkIndex)">{{ linkData.ref }}</label>
              </span>
            </li>
          </ul>
      </div>

      <div class="alpheios-modal-footer">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click = "getDocument" :disabled="uploadButtonDisabled">Upload</button>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="closeModal" :disabled="showWaiting">Cancel</button>
      </div>
    </modal>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import UploadController from '@/lib/controllers/upload-controller.js'

import UploadDTSAPI from '@/lib/upload/upload-dts-api.js'
import DtsApiPagination from '@/vue/text-editor/dts-api-pagination.vue'
import Waiting from '@/vue/common/waiting.vue'
import XCloseIcon from '@/inline-icons/x-close.svg'

export default {
  name: 'UploadDTSAPIBlock',
  components: {
    xCloseIcon: XCloseIcon,
    waiting: Waiting,
    dtsApiPagination: DtsApiPagination
  },
  props: {
    mname: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      homeLinks: [],
      content: [],
      pagination: null,
      contentUpdated: 1,
      showWaiting: false,
      breadcrumbs: [],
      checkedRefs: [],
      showDescriptionDetails: false
    }
  },
  mounted () {
    this.homeLinks = UploadDTSAPI.rootCollections
    
    this.breadcrumbs.push({ title: 'Home' })
    this.updateContent(this.homeLinks, false)
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    title () {
      return this.l10n.getMsgS('UPLOAD_DTSAPI_TITLE')
    },
    descriptionTitle () {
      return this.l10n.getMsgS('UPLOAD_DTSAPI_DESCRIPTION_TITLE') 
    },
    descriptionDetails () {
      return this.l10n.getMsgS('UPLOAD_DTSAPI_DESCRIPTION_DETAILS') 
    },
    
    contentAvailable () {
      return this.contentUpdated && Boolean(this.content) 
    },
    classes () {
      return `alpheios-alignment-editor-modal-dts-api alpheios-alignment-editor-modal-${this.mname}`
    },
    cssClasses () {
      return {
        'alpheios-editor-content-list__col2': this.content.length <= 20,
        'alpheios-editor-content-list__col4': this.content.length > 20
      }
    },
    uploadButtonDisabled () {
      return this.contentUpdated && ((this.content.length === 0) || ((this.content.length > 0) && (this.content[0].type === 'Collection')) || (this.checkedRefs.length === 0))
    },
    showBreadcrumbs () {
      return this.breadcrumbs.length > 1
    },
    showDescription () {
      return !this.showWaiting && this.contentAvailable && (this.content.length > 0) && (this.content[0].type === 'document') 
    },
    showEntireDocument () {
      return this.content && (this.content.length > 0) && (this.content[0].type === 'document')
    }
  },
  methods: {
    /**
     * Defines css class for checkbox or simple link for refs
     * @param {Object} crumb - single breadcrumb
     *        {Array[Object]} content - saved content for the breadcrumb
     *        {String} title
     * @returns {Object} - :class definition
     */
    crumbClass (crumb) {
      return {
        'alpheios-editor-content-breadcrumbs__link': (Boolean(crumb.content) && crumb.content.length > 0) || (Boolean(crumb.content && crumb.content.links) && crumb.content.links.length > 0)
      }
    },

    /**
     * Defines css id for each ref block in content
     * @param {Number} refIndex - single breadcrumb
     * @returns {String} - css id
     */
    contentRefId (refIndex) {
      return `alpheios-editor-content-link-ref-${refIndex}`
    },

    /**
     * Uploads content for the clicked breadcrumb
     * @param {Object} crumb - single breadcrumb
     *        {Array[Object]} content - saved content for the breadcrumb
     *        {String} title
     * @param {Number} crumbIndex - index of the given breadcrumb
     */
    clickCrumb (crumb, crumbIndex) {
      this.clearContent(false)

      this.updateContent(crumb.content)

      this.breadcrumbs.splice(crumbIndex + 1)
      crumb.content = undefined
    },

    /**
     * Clears content block with/without showing waiting gif
     * @param {Boolean} showWaiting - true - shows waiting gif
     */
    clearContent (showWaiting = true) {
      this.content = []
      this.checkedRefs = []
      this.contentUpdated++
      this.showWaiting = showWaiting
    },

    /**
     * Updates content in the block 
     * @param {Array[Object]} - content for updating content block
     * @param {Boolean} showWaiting - true - shows waiting gif
     */
    updateContent (content = null, showWaiting = false) {
      if (content) {
        const finalContent = content.links ? content.links : content
        this.content.splice(0, this.content.length)
        this.content.push(...finalContent)

        this.pagination = content.pagination ?  Object.assign({}, this.pagination, content.pagination) : null
      }

      this.showWaiting = showWaiting
      this.contentUpdated++
    },

    /**
     * Updates breadcrumb
     * @param {Object} linkData - clicked linkData for placing to breadcrumbs
     *        {String} type - Collection/Navigation
     *        {String} id - unique id for getting data from DTS API
     *        {String} title - title for the link
     */
    updateBreadcrumbs(linkData) {
      if (linkData.title) {
        let contentData = {
          links: this.content,
          pagination: this.pagination
        }

        this.breadcrumbs[this.breadcrumbs.length - 1].content = contentData
        this.breadcrumbs.push({ title: linkData.title, page: linkData.page })
      }
    },

    /**
     * Retrives a collection from DTS API and uploads to the modal
     * @param {Object} linkData - clicked linkData for placing to breadcrumbs
     *        {String} type - Collection/Navigation
     *        {String} id - unique id for getting data from DTS API
     *        {String} title - title for the link
     *        {String} baseUrl - defines DTS API
     */
    async getCollection (linkData) {     
      this.updateBreadcrumbs(linkData)
      this.clearContent()
      const content = await UploadController.upload('dtsAPIUpload', {linkData, objType: 'collection'})
      this.updateContent(content)
    },

    async getNavigation (linkData) {     
      this.updateBreadcrumbs(linkData)
      this.clearContent()
      
      const content = await UploadController.upload('dtsAPIUpload', {linkData, objType: 'navigation'})
      this.updateContent(content)
    },

    /**
     * Defines refParams for getting Document
     * @returns {Object}
     *          {String} ref - to get one passage by ref
     *          {String} start - a starting passage for getting a range of passages
     *          {String} end - an ending passage for getting a range of passages
     */
    defineRefParams () {
      let refParams = {}

      if (this.checkedRefs.length === 1) {
        refParams = { ref: this.content[this.checkedRefs[0]].ref }
      } else {
        this.checkedRefs.sort((a, b) => a-b)
        refParams = { start: this.content[this.checkedRefs[0]].ref, end: this.content[this.checkedRefs[this.checkedRefs.length-1]].ref }
      }
      return refParams
    },

    /**
     * Retrives a XML Document from DTS API, closes the modal and uploads text to the text-editor-single
     */
    async getDocument () {
      const linkData = this.content[this.checkedRefs[0]]

      const refParams = this.defineRefParams()     
      this.showWaiting = true

      const result = await UploadController.upload('dtsAPIUpload', {linkData, objType: 'document', refParams})

      this.showWaiting = false
      if (result) {
        this.checkedRefs.splice(0, this.checkedRefs.length)

        this.$emit('uploadFromDTSAPI', result)
        this.$emit('closeModal')
        return true
      }
    },

    async getEntireDocument () {
      const linkData = this.content[0]
      this.showWaiting = true

      const result = await UploadController.upload('dtsAPIUpload', {linkData, objType: 'document'})

      this.showWaiting = false
      if (result) {
        this.$emit('uploadFromDTSAPI', result)
        this.$emit('closeModal')
        return true
      }
    },

    closeModal () {
      this.checkedRefs.splice(0, this.checkedRefs.length)
      this.$emit('closeModal')
    },

    async getPage (pageNum) {
      const linkData = {
        id: this.pagination.id,
        baseUrl: this.pagination.baseUrl,
        page: pageNum
      }
      this.updateBreadcrumbs(linkData)
      this.clearContent()
      const content = await UploadController.upload('dtsAPIUpload', {linkData, objType: 'collection'})
      this.updateContent(content)
    }
  }
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