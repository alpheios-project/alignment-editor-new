<template>
    <modal v-if="showModal" @close="$emit('closeModal')">
        <template v-slot:header>{{ title }}</template>
        
        <template v-slot:body v-if="contentAvailable">
          <ul class="alpheios-editor-content-list" >
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

import { ClientAdapters } from 'alpheios-client-adapters'

export default {
  name: 'UploadDTSAPIBlock',
  components: {
    modal: Modal
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
      contentUpdated: 1
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
    }
  },
  methods: {
    defineGetDataMethod (linkData) {
      if (linkData.type === 'Collection') {
        return 'getCollection'
      }
    },
    async getData (linkData) {
      const method = this.defineGetDataMethod(linkData)

      if (method) {
        let data = await ClientAdapters.dtsapiGroup.dtsapi({
          method,
          params: {
            baseUrl: linkData.baseUrl,
            id: linkData.id
          }
        })

        console.info('getCollection', data)
        this.convertToContent(data.result)
      }
    },

    convertToContent (data) {
      const baseUrl = this.content[0].baseUrl
      this.content = []

      if (data.members) {
        data.members.forEach(dataMember => {
          const link = {
            baseUrl,
            title: dataMember.title,
            id: dataMember.id,
            type: 'Collection'
          }
          this.content.push(link)
        })
      }

      console.info('this.content - ', this.content)
      this.contentUpdated++
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
}
.alpheios-editor-content-link {
  cursor: pointer;
  display: inline-block;
  text-decoration: underline;
  width: 100%;
  padding-bottom: 20px;
}
</style>