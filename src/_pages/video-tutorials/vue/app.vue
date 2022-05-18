<template>
  <div class="alpheios-alignment-separate-page alpheios-alignment-video-tutorials" id="alpheios-video-tutorials" >
      <div class="alpheios-alignment-editor__intro">
        <div class="alpheios-alignment-editor__page-container">
          <div class="alpheios-alignment-editor__page-header">
            <div class="alpheios-alignment-editor__page-header-title">
              <span class="alpheios-alignment-editor-big-icon">
                <videos-icon />
              </span>
              <h2 class="alpheios-alignment-editor__page-title">Quick Start Videos</h2>
            </div>
            <div class="alpheios-header-logo">
              <a href="/">
                <img src="images/alpheios-logo-black-2.png" class="alpheios-logo">
              </a>
            </div>
          </div><!-- alpheios-alignment-editor__page-header -->

          <div class="alpheios-alignment-editor__page-content">
            <div class="alpheios-alignment-editor__page-content-item">
              <lazy-youtube src="https://www.youtube.com/watch?v=WaLMw7XYhtc" />
            </div>

            <div class="alpheios-alignment-editor__page-content-item">
              <lazy-youtube src="https://youtu.be/0DOEFG-aj04" />
            </div>
          </div><!-- alpheios-alignment-editor__page-content -->
        </div><!-- alpheios-alignment-editor__page-container -->
      </div>
  </div>
</template>
<script>
import VideosIcon from '@/inline-icons/pages/videos.svg'
import { LazyYoutube } from "vue-lazytube";

export default {
  name: 'VideoTutorials',
  components: {
    videosIcon: VideosIcon,
    lazyYoutube: LazyYoutube
  },
  data () {
    return {
    }
  },
  mounted () {
    console.info(' this', this)
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style lang="scss">
.alpheios-alignment-video-tutorials { 
  .alpheios-alignment-editor__intro {
    background: #f1fafc;
    background-repeat: repeat;
    background-position: 98% 20%;
    background-size: 30% auto;
  }

  .alpheios-alignment-editor__page-header {
    background: #f1fafc;
    padding: 20px;
    display: flex;
    justify-content: space-between;

    .alpheios-alignment-editor-big-icon {
      display: inline-block;
      width: 170px;
      height: 170px;
      vertical-align: middle;

      svg {
        display: block;
        width: 100%;
        height: 100%;
      }
    }

    .alpheios-alignment-editor__page-title {
      display: inline-block;
      font-size: 50px;
      padding: 50px 0 0 30px;
      text-align: right;
      vertical-align: middle;
      line-height: 1;
    }
  }
  .alpheios-alignment-editor__page-container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    background: #ffff;
    min-height: 100vh;
  }
  .alpheios-header-logo {
    padding: 10px;
    text-align: right;
    a {
      display: inline-block;
    }
    img {
      width: 180px;
    }
  }

  .alpheios-alignment-editor__page-content {
    text-align: center;

    .alpheios-alignment-editor__page-content-item {
      display: inline-block;
      vertical-align: top;
      width: 500px;
      padding: 20px;
    }    
  } 
}


</style>