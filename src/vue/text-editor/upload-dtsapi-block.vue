<template>
    <modal v-if="showModal" @close="$emit('closeModal')">
        <template v-slot:header>{{ title }}</template>
        
        <template v-slot:body v-if="contentAvailable">
          <waiting v-show="showWaiting" />

          <ul class="alpheios-editor-content-list" :class = "cssClasses">
            <li class="alpheios-editor-content-link"
              v-for = "(linkData, linkIndex) in content" :key = "linkIndex"
              @click = "getData(linkData)"
            >{{ linkData.title }}</li>
          </ul>
        </template>

        <template v-slot:footer>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="$emit('upload')">Upload</button>
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
      content: [
        { baseUrl: 'https://dts.alpheios.net/api/dts/', title: 'Alpheios DTS API', type: 'Collection' }
      ],
      contentUpdated: 1,
      showWaiting: false,
      baseUrl: 'https://dts.alpheios.net/api/dts/'
    }
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
    }
  },
  methods: {
    defineGetDataMethod (linkData) {
      if (linkData.type === 'Collection') {
        return 'getCollection'
      }
    },

    clearContent (showWaiting = true) {
      this.content = []
      this.contentUpdated++
      this.showWaiting = showWaiting
    },

    updateContent (showWaiting = false) {
      this.showWaiting = showWaiting
      this.contentUpdated++
    },

    async getData (linkData) {
      // console.info('getData', linkData)
      this.clearContent()

      let result
      if (linkData.type === 'Collection') {
        result = await this.getCollection(linkData)
      } else if (linkData.type === 'Navigation') {
        result = await this.getDocument(linkData)
      }
      return result
    },

    async getDocument (linkData) {
      let data = await ClientAdapters.dtsapiGroup.dtsapi({
        method: 'getDocument',
        params: {
          baseUrl: linkData.baseUrl,
          id: linkData.id,
          refParams: { ref: linkData.ref }
        }
      })

      this.clearContent()
      
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
  text-decoration: underline;
  width: 100%;
  padding-bottom: 20px;
}
</style>