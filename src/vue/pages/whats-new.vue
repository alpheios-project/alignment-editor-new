<template>
  <div class="alpheios-alignment-separate-page alpheios-alignment-whats-new" id="alpheios-whats-new" >
      <div class="alpheios-alignment-editor__intro">
        <div class="alpheios-alignment-editor__page-container">
            <div class="alpheios-header-logo">
              <router-link to="/">
                <img src="images/alpheios-logo-black-2.png" class="alpheios-logo">
              </router-link>
            </div>
          <div class="alpheios-alignment-editor__title">
            <h2 class="">WHAT YOU CAN MAKE WITH THIS</h2>
          </div>
        </div>

          <div class="alpheios-alignment-editor__content-part alpheios-alignment-editor__content-part-1">
            <div class="alpheios-alignment-editor__page-container">
              <p>The Alpheios Alignment Editor lets you create pages like this</p>
              <div class="alpheios-alignment-editor__content-slider">
                <vue-agile ref = "main" :autoplay="true" :dots="false" :fade="true" :navButtons="false" 
                           :autoplay-speed="4000" :speed="2500" :pause-on-hover="true"
                >
                  <div class="alpheios-alignment-editor__content-slide" v-for = "(slideData, slideIndex) in slidesList" :key = "slideIndex">
                      <img :src="slideData.src">
                  </div>
                  
                </vue-agile>
              </div>
              <p>where the words and phrases of some text and aligned with those of one or more translations.</p>
            </div>
          </div><!-- alpheios-alignment-editor__content-part-1 -->

          <div class="alpheios-alignment-editor__content-part alpheios-alignment-editor__content-part-2">
            <div class="alpheios-alignment-editor__page-container">
              <p>Although it was developed to correct the output of automatic aligners the Alpheios Alignment Editor has given thousands of people  
                the opportunity to get to know texts of importance to them in a new and deeper way- 
                by studying the equivalents of the words they know so well in a different language.</p>
              <p>This new version of our alignment editor benefits from the many comments and criticisms we have received in the past and we hope its new options will be popular.</p>


              <div class="alpheios-alignment-editor-main-button-block">
                <router-link to="/">
                  Go to the Alignment Editor ->
                </router-link>
              </div>
            </div>
          </div><!-- alpheios-alignment-editor__content-part-2 -->

          <div class="alpheios-alignment-editor__content-part alpheios-alignment-editor__content-part-3">
            <div class="alpheios-alignment-editor__page-container">
              <h3>Who are our target users?</h3>
              <p class="alpheios-alignment-editor__p-with-check-mark" style="background-image: url('images/check-mark.svg')">Anyone who wants to become more deeply familiar with a favorite text, be it religiou, literary, philosophical, etc</p>
              <p class="alpheios-alignment-editor__p-with-check-mark" style="background-image: url('images/check-mark.svg')">Anyone studying the process of translation- and its challenges</p>
              <p class="alpheios-alignment-editor__p-with-check-mark" style="background-image: url('images/check-mark.svg')">Anyone studying Rezeptionsgeschichte of important texts in different cultures</p>
              <p class="alpheios-alignment-editor__p-with-check-mark" style="background-image: url('images/check-mark.svg')">Anyone wishing to learn a new language by the empirical method - 
              possibly not the fastest if you are studying for a test or a new job but easily the most enjoyable if you have a deeply interesting text (and quite possibly the method whose knowledge suffers the least attrition over time) </p>
            </div>
          </div><!-- alpheios-alignment-editor__content-part-3 -->

          <div class="alpheios-alignment-editor__content-part alpheios-alignment-editor__content-part-4">
            <div class="alpheios-alignment-editor__page-container">
              <h3>This new version of our alignment editor</h3>
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow.svg')">lets you perform all the actual alignment while offline</p>
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow.svg')">lets you export unfinished alignments to be completed later or by others on other computers</p>
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow.svg')">gives you six different display modes from alignments you have made only once</p>
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow.svg')">gives you all those display modes on a single, self-contained html page viewable offline in Chrome, Firefox or Safari</p>

              <div class="alpheios-alignment-editor-main-button-block">
                <router-link to="/">
                  Go to the Alignment Editor ->
                </router-link>
              </div>
            </div>
          </div><!-- alpheios-alignment-editor__content-part-4 -->

          <div class="alpheios-alignment-editor__content-part alpheios-alignment-editor__content-part-5">
            <div class="alpheios-alignment-editor__page-container">
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow-white.svg')">you can enter either plain text or text with XML-markup</p>
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow-white.svg')">you can enter quite large texts - whole chapters if necessary</p>
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow-white.svg')">you can edit texts after they have been aligned (with a new Token Editor)</p>
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow-white.svg')">you have many opportunities to customize the behavior of the application</p>
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow-white.svg')">if you are online you can use the Alpheios Reading Tools from within the editor</p>
            </div>
          </div><!-- alpheios-alignment-editor__content-part-5 -->

          <div class="alpheios-alignment-editor__content-part alpheios-alignment-editor__content-part-6">
            <div class="alpheios-alignment-editor__page-container">
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow.svg')">compatibility with other popular alignment editors such as Ugarit (for display)</p>
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow.svg')">automatic language detection</p>
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow.svg')">use of indexedDB to store large texts locally</p>
              <p class="alpheios-alignment-editor__p-with-arrow-mark" style="background-image: url('images/arrow.svg')">adding descriptions to the texts and brief annotations to the words</p>

              <div class="alpheios-alignment-editor-main-button-block">
                <router-link to="/">
                  Go to the Alignment Editor ->
                </router-link>
              </div>
            </div>
          </div><!-- alpheios-alignment-editor__content-part-4 -->
        </div>

        <div class="alpheios-alignment-editor__footer">
          <p class="alpheios-alignment-editor__footer-copyright">Copyright © The Alpheios Project, Ltd. 2019. All Rights Reserved</p>
        </div>
      
    </div>
</template>
<script>
import DocumentUtility from '@/lib/utility/document-utility.js'
import LogoIcon from '@/vue/pages/logo-svg.vue'

import slide2ColumnsPNG from '@/_images/slider2/slide-2-columns.png'
import slide3ColumnsPNG from '@/_images/slider2/slide-3-columns.png'
import slideShortPNG from '@/_images/slider2/slide-short.png'
import slideEquivalentsPNG from '@/_images/slider2/slide-equivalents.png'
import slideInterlinearPNG from '@/_images/slider2/slide-interlinear.png'
import slideSentencePNG from '@/_images/slider2/slide-sentence.png'

import { VueAgile } from 'vue-agile'

export default {
  name: 'WhatsNew',
  components: {
    logoIcon: LogoIcon,
    vueAgile: VueAgile
  },
  data () {
    return {
      slide2ColumnsPNG: slide2ColumnsPNG,
      slide3ColumnsPNG: slide3ColumnsPNG,
      slideShortPNG: slideShortPNG,
      slideEquivalentsPNG: slideEquivalentsPNG,
      slideInterlinearPNG: slideInterlinearPNG,
      slideSentencePNG: slideSentencePNG,

      slidesList: [
        { src: slide2ColumnsPNG },
        { src: slide3ColumnsPNG },
        { src: slideShortPNG },
        { src: slideEquivalentsPNG },
        { src: slideInterlinearPNG },
        { src: slideSentencePNG }
      ]
    }
  },
  beforeRouteEnter(to, from, next) {  
    DocumentUtility.setPageClassToBody('whats-new')
    next()
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style lang="scss">
.alpheios-alignment-whats-new { 
.alpheios-alignment-editor__intro {
    background: #f1fafc;
    background-repeat: repeat;
    background-position: 98% 20%;
    background-size: 30% auto;
  }

  .alpheios-alignment-editor__page-container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .alpheios-alignment-editor-big-icon {
    display: inline-block;
    width: 200px;
    height: auto;
    vertical-align: middle;

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
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

  .alpheios-alignment-editor__title {
    padding: 50px 0;
    h2 {
      padding: 0 20px;
      font-size: 300%;
      font-family: "Source Serif Pro",serif;
      margin: 0;
      margin-left: 80px;
      color: #90a959;
    }
  }

  .alpheios-alignment-editor__content-slider {
    // padding: 20px;
    background: #ffffff;

    .alpheios-alignment-editor__content-slide {
      img {
        display: block;
        width: 100%;
      }
    }
  }

  .alpheios-alignment-editor__content-part {
    padding: 0;
    font-size: 115%;
    text-align: center;

    &.alpheios-alignment-editor__content-part-1 {
      background: #0E2233;
      padding: 0;

      p {
        padding: 40px 20px;
        margin: 0;
        font-size: 125%;
        text-align: center;
        color: #ffffff;
      }
    }

    &.alpheios-alignment-editor__content-part-2 {
      background: #ffffff;
      padding: 40px 50px;
    }

    &.alpheios-alignment-editor__content-part-3 {
      background: #0E2233;
      padding: 40px 20px;
      color: #ffffff;

      h3 {
        margin: 0 0 40px;
        font-size: 200%;
        text-align: center;
      }

      p {
        text-align: left;
        &.alpheios-alignment-editor__p-with-check-mark {
          background-position: 0 50%;
          background-size: 30px auto;
          padding: 0 50px;
          background-repeat: no-repeat;
        }
        
      }

    }

    &.alpheios-alignment-editor__content-part-4,
    &.alpheios-alignment-editor__content-part-6 {
      background: #ffffff;
      padding: 40px 20px;
      h3 {
        margin: 0 0 40px;
        font-size: 200%;
        text-align: center;

        color: #0E2233;
      }

      p {
        text-align: left;
        &.alpheios-alignment-editor__p-with-arrow-mark {
          background-position: 0 50%;
          background-size: 30px auto;
          padding: 0 50px;
          background-repeat: no-repeat;
        }
        
      }
    }

    &.alpheios-alignment-editor__content-part-5 {
      background: #0E2233;
      padding: 40px 20px;
      color: #ffffff;

      p {
        text-align: left;
        &.alpheios-alignment-editor__p-with-arrow-mark {
          background-position: 0 50%;
          background-size: 30px auto;
          padding: 0 50px;
          background-repeat: no-repeat;
        }
        
      }
    }
  }

  .alpheios-alignment-editor__footer {
    background: #0E2233;
    padding: 40px 20px;
    color: #ffffff;

    .alpheios-alignment-editor__footer-copyright {
      text-align: right;
    }
  }

  .alpheios-alignment-editor-main-button-block {
    a {
      display: inline-block;
      padding: 20px;
      text-decoration: none;
      color: #fff;
      background: #90a959;
      text-transform: uppercase;
      font-weight: bold;
      border-radius: 15px;

      box-shadow: 3px 3px 2px 0px rgba(28,33,17,0.75);
      -webkit-box-shadow: 3px 3px 2px 0px rgba(28,33,17,0.75);
      -moz-box-shadow: 3px 3px 2px 0px rgba(28,33,17,0.75);
    }
  }
}
</style>
