<template>
    <modal v-if="showModal" @close="$emit('closeModal')">
        <template v-slot:header>
          <p class="alpheios-editor-content-title">{{ title }}</p>
          <ul class="alpheios-editor-content-breadcrumbs">
            <li v-for="(crumb, crumbIndex) in breadcrumbs" :key="crumbIndex" 
                :class = "crumbClass(crumb)"
                @click = "clickCrumb(crumb, crumbIndex)"
            >
              {{ crumb.title }}
            </li>
          </ul>
        </template>
        
        <template v-slot:body v-if="contentAvailable">
          <waiting v-show="showWaiting" />
          <ul class="alpheios-editor-content-list" :class = "cssClasses" v-show="!showWaiting">
            <li class="alpheios-editor-content-link"
              v-for = "(linkData, linkIndex) in content" :key = "linkIndex"
            >
              <span v-if="linkData.type === 'Collection'" class="alpheios-editor-content-link__text" @click = "getData(linkData)">{{ linkData.title }}</span>

              <span v-if="linkData.type === 'Navigation'" class="alpheios-editor-content-link__checkbox">
                <input type="checkbox" :id="contentRefId(linkData.ref)" :value="linkIndex" v-model="checkedRefs">
                <label :for="contentRefId(linkData.ref)">{{ linkData.title }}</label>
              </span>
            </li>
          </ul>
        </template>

        <template v-slot:footer>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click = "getDocumentRefs" :disabled="uploadButtonDisabled">Upload</button>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="$emit('closeModal')">Cancel</button>
        </template>
    </modal>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Modal from '@/vue/common/modal.vue'
import Waiting from '@/vue/common/waiting.vue'

import { ClientAdapters } from 'alpheios-client-adapters'


export default {
  name: 'UploadDTSAPIBlock',
  components: {
    modal: Modal,
    waiting: Waiting
  },
  props: {
    showModal: {
    type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      homeLinks: [],
      content: [],
      contentUpdated: 1,
      showWaiting: false,
      baseUrl: 'https://dts.alpheios.net/api/dts/',
      cachedContent: {},
      breadcrumbs: [],
      checkedRefs: []
    }
  },
  mounted () {
    this.homeLinks = [
        { baseUrl: 'https://dts.alpheios.net/api/dts/', title: 'Alpheios DTS API', type: 'Collection' }
      ]
    
    this.content = [...this.homeLinks]
    this.breadcrumbs.push({ title: 'Home' })
    this.updateContent(false)
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    title () {
      return this.l10n.getMsgS('UPLOAD_DTSAPI_TITLE')
    },
    contentAvailable () {
      return this.contentUpdated && Boolean(this.content)
    },
    cssClasses () {
      return {
        'alpheios-editor-content-list__col2': this.content.length <= 20,
        'alpheios-editor-content-list__col4': this.content.length > 20
      }
    },
    uploadButtonDisabled () {
      return this.contentUpdated && ((this.content.length === 0) || ((this.content.length > 0) && (this.content[0].type === 'Collection')) || (this.checkedRefs.length === 0))
    }
  },
  methods: {
    crumbClass (crumb) {
      return {
        'alpheios-editor-content-breadcrumbs__link': Boolean(crumb.links) && crumb.links.length > 0
      }
    },

    clickCrumb (crumb, crumbIndex) {
      this.clearContent(false)

      this.breadcrumbs.splice(crumbIndex + 1)
      this.content = [...crumb.links]
      crumb.links = undefined
      
      this.updateContent()
    },

    contentRefId (ref) {
      return `alpheios-editor-content-link-ref-${ref.replace('.','_')}`
    },

    clearContent (showWaiting = true) {
      this.content = []
      this.checkedRefs = []
      this.contentUpdated++
      this.showWaiting = showWaiting
    },

    updateContent (showWaiting = false) {
      this.showWaiting = showWaiting
      this.contentUpdated++
    },

    async getData (linkData) {
      let result
      
      this.breadcrumbs[this.breadcrumbs.length - 1].links = [ ...this.content ]
      this.breadcrumbs.push({ title: linkData.title })
      this.clearContent()

      if (this.cachedContent[linkData.id]) {
        this.content = this.cachedContent[linkData.id]
        this.updateContent()
        return
      }
      result = await this.getCollection(linkData)
      
      this.cachedContent[linkData.id] = [ ...this.content ]
      return result
    },

    async getDocumentRefs () {
      let refParams = {}

      if (this.checkedRefs.length === 1) {
        refParams = { ref: this.content[this.checkedRefs[0]].ref }
      } else {
        this.checkedRefs.sort()
        refParams = { start: this.content[this.checkedRefs[0]].ref, end: this.content[this.checkedRefs[this.checkedRefs.length-1]].ref }
      }

      const linkData = this.content[this.checkedRefs[0]]
      const result = await this.getDocument(linkData, refParams)
      return result
    },

    async getDocument (linkData, refParams) {
      this.showWaiting = true
      let data = await ClientAdapters.dtsapiGroup.dtsapi({
        method: 'getDocument',
        params: {
          baseUrl: linkData.baseUrl,
          id: linkData.id,
          refParams
        }
      })
     
      this.showWaiting = false
      this.$emit('uploadFromDTSAPI', data.result)
      this.$emit('closeModal')
      return true
    },

    async getCollection (linkData) {
      let data = await ClientAdapters.dtsapiGroup.dtsapi({
        method: 'getCollection',
        params: {
          baseUrl: linkData.baseUrl,
          id: linkData.id
        }
      })

      const collection = data.result
      if ((collection.members.length === 0) && collection.navigation) { 
        await ClientAdapters.dtsapiGroup.dtsapi({
          method: 'getNavigation',
          params: {
            baseUrl: linkData.baseUrl,
            id: collection.navigation.id,
            collection
          }
        })
      }
      return this.convertToContent(collection)
    },

    convertToContent (collection) {
      if (collection.members.length > 0) {
        this.convertCollectionToLinks(collection)
      } else if (collection.navigation && collection.navigation.refs && collection.navigation.refs.length > 0) {
        this.convertNavigationToLinks(collection)
      }

      this.updateContent()
    },

    convertCollectionToLinks (collection) {
      collection.members.forEach(dataMember => {
        const link = {
          baseUrl: this.baseUrl,
          title: dataMember.title,
          id: dataMember.id,
          type: 'Collection'
        }
        this.content.push(link)
      })
    },
    convertNavigationToLinks (collection) {
      collection.navigation.refs.forEach(dataRef => {
        const link = {
          baseUrl: this.baseUrl,
          title: dataRef,
          id: collection.navigation.id,
          ref: dataRef,
          type: 'Navigation'
        }
        this.content.push(link)
      })
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
  margin: 0 0 10px 0;
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
</style>