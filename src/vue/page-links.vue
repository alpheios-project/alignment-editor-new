<template>
    <div class="alpheios-alignment-editor-initial-screen__additional-container" >
        <div class="alpheios-alignment-editor-initial-screen__additional" >
            <div class="alpheios-alignment-editor-router-link alpheios-alignment-editor-link-block">
                <a href="whats-new.html">
                    <span class="alpheios-alignment-router-link-icon">
                        <pages-icon />
                    </span>
                    <p class="alpheios-alignment-router-link-title">Context</p>
                </a>
            </div>
            <div class="alpheios-alignment-editor-link-block">
                <div class="alpheios-alignment-editor-video-block">
                    <lazy-youtube src="https://youtu.be/uPuN2hWkZIQ" :showTitle="false" />
                </div>
                <p class="alpheios-alignment-router-link-title">Overview</p>
            </div>
            <div class="alpheios-alignment-editor-router-link alpheios-alignment-editor-link-block">
                <a href="quick-start.html">
                    <span class="alpheios-alignment-router-link-icon">
                        <pages-icon />
                    </span>
                    <p class="alpheios-alignment-router-link-title">Quick Start</p>
                </a>
            </div>
        </div>
    </div>
</template>
<script>
import QuickStartIcon from '@/inline-icons/pages-quick-start.svg'
import VideoTutorialsIcon from '@/inline-icons/pages-video-tutorials.svg'
import WhatsNewIcon from '@/inline-icons/pages-whats-new.svg'

import PagesIcon from '@/inline-icons/pages-icon.svg'
import { LazyYoutube } from 'vue-lazytube'

export default {
  name: 'PageLinks',
  components: {
    quickStartIcon: QuickStartIcon,
    videoTutorialsIcon: VideoTutorialsIcon,
    whatsNewIcon: WhatsNewIcon,

    pagesIcon: PagesIcon,
    lazyYoutube: LazyYoutube
  }
}

</script>
<style lang="scss">
.alpheios-alignment-editor-initial-screen__additional-container {
    overflow: hidden;
    padding: 0;
    margin: 0;
    background: rgb(188,229,240);
    background: -moz-linear-gradient(180deg, rgba(188,229,240,0.4) 0%, rgba(196,232,242,0.7) 10%, rgba(255,255,255,0.9047328404017857) 50%, rgba(196,232,242,0.7) 90%, rgba(188,229,240,0.4) 100%);
    background: -webkit-linear-gradient(180deg, rgba(188,229,240,0.4) 0%, rgba(196,232,242,0.7) 10%, rgba(255,255,255,0.9047328404017857) 50%, rgba(196,232,242,0.7) 90%, rgba(188,229,240,0.4) 100%);
    background: linear-gradient(180deg, rgba(188,229,240,0.4) 0%, rgba(196,232,242,0.7) 10%, rgba(255,255,255,0.9047328404017857) 50%, rgba(196,232,242,0.7) 90%, rgba(188,229,240,0.4) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#bce5f0",endColorstr="#bce5f0",GradientType=1);

}
.alpheios-alignment-editor-initial-screen__additional {
    margin: 60px auto;
    text-align: center;
    max-width: 800px;
    width: 100%;
    text-align: center;

    display: flex;
    justify-content: space-between;
    margin-top: 100px;

    .alpheios-alignment-editor-link-block {
      display: inline-block;
      vertical-align: middle;
      width: 30%;

      &.alpheios-alignment-editor-router-link {
          width: 20%;
          min-width: 190px;
      }

      @media screen and (max-width: 800px) {
          display: block;
          text-align: center;
          width: 100%;

          &.alpheios-alignment-editor-router-link {
              width: 100%;
          }
      }
    }

    .alpheios-alignment-editor-video-block {
      padding: 5px;
      background: #46788d;
      overflow: hidden;
      
      @media screen and (max-width: 800px) {
        width: 90%;
        display: inline-block;
        max-width: 400px;
      }
    }

    @media screen and (max-width: 800px) {
        margin: 20px auto;
        display: block;
        text-align: center;
    }

    .alpheios-alignment-editor-router-link {
        padding: 20px;
        text-align: center;
        a {
            text-decoration: none;
            display: block;
        }

        @media screen and (max-width: 800px) {
          width: 100%;
          padding: 20px 40px;
          display: inline-block;
        }
    }

    .alpheios-alignment-router-link-icon {
        display: inline-block;
        width: 100px;
        height: 70px;
        cursor: pointer;

        svg {
          width: 100%;
          height: 100%;
          display: block;

          fill: #46788d;
          stroke: #46788d;
        }
    }

    .alpheios-alignment-router-link-title {
        color: #46788d;
        text-transform: uppercase;
        font-size: 140%;
        font-family: "Source Serif Pro",serif;
        margin: 10px 0 0;
        font-weight: bold;

        &:hover {
          color: #90a959;  
        }
    }

    .alpheios-alignment-editor-router-link {
        a:hover {
            .alpheios-alignment-router-link-icon svg {
                fill: #90a959;
                stroke: #90a959;
            }

            .alpheios-alignment-router-link-title {
                color: #90a959;  
            }
        }
    }
}

.alpheios-alignment-separate-page {
  .alpheios-alignment-editor__intro {
    background-repeat: repeat-y;
    background-position: 98% 20%;
    background-size: 20% auto;
    // overflow: hidden;
    min-height: 100vh;
    background-color: #fff;
  }
  .alpheios-header-logo {
      padding-top: 10px;
      text-align: center;
  }

  .alpheios-alignment-editor__page-title {
    font-family: "Source Serif Pro",serif;
    font-size: 50px;
    text-align: center;
    margin: 0;
    padding: 50px 0;
  }
}
</style>