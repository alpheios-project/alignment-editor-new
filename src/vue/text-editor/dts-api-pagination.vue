<template>
    <div class="alpheios-editor-content-pagination" >
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-link" @click = "getPage(first)" v-if="showPaginationFirst">{{ first }}</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-text" v-if="showPointsFirstPrevious">...</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-link" @click = "getPage(previous)" v-if="showPaginationPrevious">{{ previous }}</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-text" >{{ current }}</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-link" @click = "getPage(next)" v-if="showPaginationNext">{{ next }}</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-text" v-if="showPointsNextLast">...</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-link" @click = "getPage(last)" v-if="showPaginationLast">{{ last }}</span>

        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-go-to">
          <label class="alpheios-alignment-editor-metadata-item__label">go to the page:</label>
          <input
              class="alpheios-alignment-input alpheios-alignment-editor-pagination-go-to"
              type="number"
              v-model="goToValue"
              id="alpheios-alignment-editor-pagination-go-to-input"
              placeholder ="Go to the page"
              @keyup.enter = "goToPage"
              :min = "first"
              :max = "last"
          >
        </span>
    </div>
</template>
<script>
export default {
  name: 'UploadDTSAPIBlock',
  props: {
    first: {
      type: Number,
      required: true
    },
    previous: {
      type: Number,
      required: false
    },
    next: {
      type: Number,
      required: false
    },
    last: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      goToValue: null
    }
  },
  computed: {
    showPaginationFirst () {
      return this.first !== this.current
    },
    showPointsFirstPrevious () {
      return this.previous && (this.first !== this.previous)
    },
    showPaginationPrevious () {
      return this.previous && (this.first !== this.previous)
    },
    showPaginationNext () {
      return this.next && (this.next !== this.last)
    },
    showPointsNextLast () {
      return this.next && (this.next !== this.last)
    },
    showPaginationLast () {
      return this.last !== this.current
    }
  },
  methods: {
    getPage (pageNum) {
      this.$emit('getPage', pageNum)
    },
    goToPage () {
      if ((this.goToValue >= this.first) && (this.goToValue <= this.last) && (this.goToValue !== this.current)) {
        this.$emit('getPage', this.goToValue)
      }
    }
  }
}

</script>
<style lang="scss">
.alpheios-editor-content-pagination {
  margin-bottom: 10px;
}

.alpheios-editor-content-pagination-link {
  padding: 5px;
  background: #ddd;
  cursor: pointer;
  margin-right: 5px;
  font-weight: bold;
}

.alpheios-editor-content-pagination-text {
  padding: 5px;
  margin-right: 5px;
}

.alpheios-editor-content-pagination-span {
  display: inline-block;
}

.alpheios-editor-content-pagination-go-to input.alpheios-alignment-editor-pagination-go-to {
    display: inline-block;
    width: 150px;
}
</style>