<template>
    <div class="alpheios-alignment-editor-initial-screen__additional-container" >
        <div class="alpheios-alignment-editor-initial-screen__additional" >
            <div class="alpheios-alignment-editor-router-link">
                <a href="video-tutorials.html">
                    <span class="alpheios-alignment-router-link-icon">
                        <video-tutorials-icon />
                    </span>
                    <p class="alpheios-alignment-router-link-title"> Quick Start Video</p>
                </a>
            </div>
            <div class="alpheios-alignment-editor-router-link">
                <a href="whats-new.html">
                    <span class="alpheios-alignment-router-link-icon">
                        <whats-new-icon />
                    </span>
                    <p class="alpheios-alignment-router-link-title">What you can make with this</p>
                </a>
            </div>
            <div class="alpheios-alignment-editor-router-link">
                <a href="quick-start.html">
                    <span class="alpheios-alignment-router-link-icon">
                        <quick-start-icon />
                    </span>
                    <p class="alpheios-alignment-router-link-title">Quick Start Text</p>
                </a>
            </div>
        </div>
    </div>
</template>
<script>
import QuickStartIcon from '@/inline-icons/pages-quick-start.svg'
import VideoTutorialsIcon from '@/inline-icons/pages-video-tutorials.svg'
import WhatsNewIcon from '@/inline-icons/pages-whats-new.svg'

export default {
  name: 'PageLinks',
  components: {
    quickStartIcon: QuickStartIcon,
    videoTutorialsIcon: VideoTutorialsIcon,
    whatsNewIcon: WhatsNewIcon
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
    margin: 100px auto;
    text-align: center;
    max-width: 800px;
    width: 90%;

    @media screen and (max-width: 500px) {
        margin: 20px auto;
    }

    .alpheios-alignment-editor-router-link {
        display: inline-block;
        padding: 0 40px;
        text-align: center;
        width: 32%;
        vertical-align: top;
        a {
            text-decoration: none;
            display: inline-block;
        }

        @media screen and (max-width: 500px) {
          width: 100%;
          padding: 20px 40px;
          display: block;
        }
    }

    .alpheios-alignment-router-link-icon {
        display: inline-block;
        width: 170px;
        height: 115px;
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
        font-size: 130%;
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