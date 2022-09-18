<template>
  <div class="alpheios-alignment-separate-page alpheios-alignment-quick-start" id="alpheios-quick-start" >
      <div class="alpheios-alignment-editor__intro">
        <div class="alpheios-alignment-editor__page-container">
          <div class="alpheios-alignment-editor__page-header">
            <div class="alpheios-header-logo">
              <a href="index.html">
                <img src="images/alpheios-logo-black-2.png" class="alpheios-logo">
              </a>
            </div>
            <div class="alpheios-alignment-editor__title">
              <h2 class="">Quick Start Text</h2>
            </div>
          </div><!-- alpheios-alignment-editor__page-header -->

          <div class="alpheios-alignment-editor__page-content">
            <div class="alpheios-alignment-editor__page-content__left">
              <p class="alpheios-alignment-editor__page_list-link" 
                  @click = "shownLink = 'getting-started'"
                  :class = "{ 'alpheios-active': shownLink === 'getting-started' }"
              >Getting started</p>
              <p class="alpheios-alignment-editor__page_list-link" 
                  @click="shownLink = 'entering-text'"
                  :class = "{ 'alpheios-active': shownLink === 'entering-text' }"
              >Entering text</p>
              <p class="alpheios-alignment-editor__page_list-link" 
                  @click="shownLink = 'aligning'"
                  :class = "{ 'alpheios-active': shownLink === 'aligning' }"
              >Aligning</p>
              <p class="alpheios-alignment-editor__page_list-link" 
                  @click="shownLink = 'saving'"
                  :class = "{ 'alpheios-active': shownLink === 'saving' }"
              >Saving</p>
              <p class="alpheios-alignment-editor__page_list-link" 
                  @click="shownLink = 'displaying'"
                  :class = "{ 'alpheios-active': shownLink === 'displaying' }"
              >Displaying</p>
            </div>

            <div class="alpheios-alignment-editor__page-content__right">
              <div class="alpheios-alignment-editor__page-content__item" v-show="shownLink === 'getting-started'">
                <p>Go to the website alpheios.alignmentEditor.html  The libraries the editor needs will be automatically loaded 
                  into your browser and bring you to an initial screen where you will see the options to either begin a new alignment or resume a previous one. </p>
                <p>The application will then prompt you to give a short name to this alignment and open the initial screen, the ENTER TEXT screen.</p>

                <p class="alpheios-alignment-editor__page-content__item-img"><img :src="newAlignmentTitlePNG"></p>
                <p>Although you can work offline during the actual aligning, it is a good idea to stay online until after you have entered the text you want to align 
                  and the alignment editor has taken advantage of remote services to identify the language and tokenize the text accordingly to prepare it for alignment.</p>

                <div class="alpheios-alignment-editor__page-content__nav-links">
                  <span class="alpheios-alignment-editor__page-content__nav-link-left"></span>
                  <span class="alpheios-alignment-editor__page-content__nav-link-right" @click="shownLink = 'entering-text'">Entering text >></span>
                </div>
              </div><!-- alpheios-alignment-editor__page-content__item -->

              <div class="alpheios-alignment-editor__page-content__item" v-show="shownLink === 'entering-text'">
                <p>You can type or paste text into the two empty boxes on this screen or upload files. Both plain text and text with markup such as XML can be entered. Quite large files can be entered, 
                  as much as a book chapter if necessary, and will later be split into smaller parts for more convenient processing and display.</p>
                <p>You can add any number of additional translations with the + button.</p>
                <p class="alpheios-alignment-editor__page-content__item-img"><img :src="enterTextScreenPNG"></p>
                <p>When you have finished entering text, the DONE button will tell the application to prepare the text for alignment by tokenizing it.</p>
                <p>Alignment can only performed on the ALIGN TEXT screen, which comes up next.</p>

                <div class="alpheios-alignment-editor__page-content__nav-links">
                  <span class="alpheios-alignment-editor__page-content__nav-link-left" @click = "shownLink = 'getting-started'"><< Getting started</span>
                  <span class="alpheios-alignment-editor__page-content__nav-link-right" @click="shownLink = 'aligning'">Aligning >></span>
                </div>
              </div><!-- alpheios-alignment-editor__page-content__item -->

              <div class="alpheios-alignment-editor__page-content__item" v-show="shownLink === 'aligning'">
                <p>To align words or phrases in one language with those in another:</p>
                <ul>
                  <li>Enter text from one language in the box on the left and text from the other in the box on the right.</li>
                  <li>Click on the all the words in the first language that you want to make part of an alignment, turning them green - indicating that an alignment has started.</li>
                  <li>Go to the other box and click on all the words you want to make part of the same alignment link, turning them amber.</li>
                  <li>Return to the initial language box and click on any green word to establish the alignment link, turning all the words that are part of that link black in both languages.</li>
                </ul>
                <p class="alpheios-alignment-editor__page-content__item-img"><img :src="alignScreenTextPNG"></p>
                <p>Now when you mouse over any word in that alignment group in either language, the whole alignment link will be highlighted in both languages.</p>

                <p>To unlink simply reverse the process.</p>
                <ul>
                  <li>Click on a word in an alignment group in either entry box, turning all its words green.</li>
                  <li>Go to the entry box on the other side and click on each of the aligned words in turn, returning them to red.</li>
                  <li>Return to the first box and click on all the remaining words in the alignment link.</li>
                </ul>
                <p>All the words in the alignment group should now have returned to their original red color, indicating that they are not aligned.</p>

                <p>To add an annotation to a word, SHIFT-click on it.</p>
                <p class="alpheios-alignment-editor__page-content__item-img"><img :src="newAnnotationPNG"></p>
                <p>To look up a word with the Alpheios Reading tools you can CTL-click on it in Windows and CMD-click on it on a Mac but only when you are online.</p>
                <p>To edit text after it has been tokenized, enable the TOKEN EDITOR in the ALIGN TEXT options, and make your desired changes on the TOKEN EDITOR screen. 
                  Your changes will be shown when you return to the ALIGN TEXT screen.</p>

                <div class="alpheios-alignment-editor__page-content__nav-links">
                  <span class="alpheios-alignment-editor__page-content__nav-link-left" @click = "shownLink = 'entering-text'"><< Entering text</span>
                  <span class="alpheios-alignment-editor__page-content__nav-link-right" @click="shownLink = 'saving'">Saving >></span>
                </div>

              </div><!-- alpheios-alignment-editor__page-content__item -->

              <div class="alpheios-alignment-editor__page-content__item" v-show="shownLink === 'saving'">
                <p>By default the application automatically saves a current copy of your work, which should protect it against sudden loss of power or other unpredictable interruptions, 
                  as well as provide a reliably current version for resuming where you left off (shown in a list under the Resume Previous Alignment button).</p>
                <p>But remember that if you let your disk fill completely you will lose all these automatically saved files along with the instance of indexedDB that created them. 
                  Files you save yourself are of course immune to this hazard.</p>
                <p>At any point in the alignment you can also save your work yourself, choosing JSON format if you are unfinished or think you may want to modify 
                  the alignment in the future, or the final HTML format, which gives you multiple display options, but cannot easily be edited.</p>
                <p class="alpheios-alignment-editor__page-content__item-img"><img :src="savingPNG"></p>
                <ul>
                  <li>the <b>JSON</b> version can only be resumed by some copy of the alpheios alignment editor,</li>
                  <li>the <b>HTML</b> version can be displayed reliably by Chrome, Firefox and Safari even when you are not connected to the internet.</li>
                </ul>
                <p>You can also export just the alignments in a simple csv format the would allow them to be easily imported into other applications.</p>

                <div class="alpheios-alignment-editor__page-content__nav-links">
                  <span class="alpheios-alignment-editor__page-content__nav-link-left" @click = "shownLink = 'aligning'"><< Aligning</span>
                  <span class="alpheios-alignment-editor__page-content__nav-link-right" @click="shownLink = 'displaying'">Displaying >></span>
                </div>
              </div><!-- alpheios-alignment-editor__page-content__item -->

              <div class="alpheios-alignment-editor__page-content__item" v-show="shownLink === 'displaying'">
                <p>The final output of the alignment editor is an HTML file with multiple display options:</p>
                <table class="alpheios-alignment-editor_table">
                  <tr>
                    <td class="alpheios-alignment-editor_td1">two column</td>
                    <td>similar to the appearance when they were created</td>
                  </tr>
                  <tr>
                    <td class="alpheios-alignment-editor_td1">three column</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="alpheios-alignment-editor_td1">short</td>
                    <td>just the words participating in the alignment</td>
                  </tr>
                  <tr>
                    <td class="alpheios-alignment-editor_td1">equivalents</td>
                    <td>all the alternative translations for the same original words occurring in the same translation</td>
                  </tr>
                  <tr>
                    <td class="alpheios-alignment-editor_td1">interlinear</td>
                    <td>multiple translations can be shown</td>
                  </tr>
                  <tr>
                    <td class="alpheios-alignment-editor_td1">context</td>
                    <td>the sentence context in which the alignment occurs; by default one sentence</td>
                  </tr>
                </table>
                <p>A menu at the upper left of the screen lets you choose which translations should participate in the display and their sequence.</p>
                <p>By default all available translations will participate in the short and equivalents displays.</p>
                <div class="alpheios-alignment-editor__page-content__info-block">
                  <p>All these options will display properly even when offline.</p>
                </div>

                <div class="alpheios-alignment-editor__page-content__nav-links">
                  <span class="alpheios-alignment-editor__page-content__nav-link-left" @click = "shownLink = 'saving'"><< Saving</span>
                  <span class="alpheios-alignment-editor__page-content__nav-link-right"></span>
                </div>
              </div><!-- alpheios-alignment-editor__page-content__item -->
              
            </div><!-- alpheios-alignment-editor__page-content__right -->
            <div class="alpheios-alignment-editor-main-button-block" v-show="shownLink === 'displaying'">
              <a class="alpheios-alignment-editor-main-button-link" href="index.html">
                Go to the Alignment Editor ->
              </a>
            </div>
          </div><!-- alpheios-alignment-editor__page-content -->
        </div><!-- alpheios-alignment-editor__page-container -->
        <div class="alpheios-alignment-editor__footer">
          <div class="alpheios-alignment-editor__footer-inner">
            <p class="alpheios-alignment-editor__footer-copyright">Copyright © The Alpheios Project, Ltd. 2019. All Rights Reserved</p>
          </div>
        </div>
      </div>
  </div>
</template>
<script>
import BooksIcon from '@/inline-icons/pages/books.svg'
import newAlignmentTitlePNG from '@/_images/new-alignment-title.png'
import enterTextScreenPNG from '@/_images/enter-text-screen.png'
import alignScreenTextPNG from '@/_images/align-screen-text.png'
import newAnnotationPNG from '@/_images/new-annotation.png'
import savingPNG from '@/_images/saving.png'

export default {
  name: 'QuickStart',
  components: {
    booksIcon: BooksIcon
  },
  data () {
    return {
      shownLink: 'getting-started',

      newAlignmentTitlePNG: newAlignmentTitlePNG,
      enterTextScreenPNG: enterTextScreenPNG,
      alignScreenTextPNG: alignScreenTextPNG,
      newAnnotationPNG: newAnnotationPNG,
      savingPNG: savingPNG
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style lang="scss">

.alpheios-alignment-quick-start { 
    h1, h2, h3, h4, h5, h6 {
        font-family: "Source Serif Pro", Arial, serif;
    }
  .alpheios-alignment-editor__intro {
    background: #f1fafc;
    background-repeat: repeat;
    background-position: 98% 20%;
    background-size: 30% auto;
  }

  .alpheios-alignment-editor__page-header {
    background: #f1fafc;
    padding: 0 20px;

    @media screen and (max-width: 800px) {
      display: block;
      padding: 0 20px 20px;
    }

    .alpheios-alignment-editor__title {
        padding: 20px 0;
        h2 {
          padding: 0 20px;
          font-size: 300%;
          font-family: "Source Serif Pro",serif;
          margin: 0;
          margin-left: 80px;
          color: #90a959;
          text-align: center;
        }
    
        @media screen and (max-width: 800px) {
          padding: 20px 0;
          h2 {
            font-size: 150%;
            margin-left: 0;
          }
        }
    }
  }
  .alpheios-alignment-editor__page-container {
    max-width: 1000px;
    width: 90%;
    margin: 0 auto;
    background: #ffff;
    min-height: calc(100vh - 136px);
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

    .alpheios-alignment-editor__page-content__left {
      padding: 40px 20px;
      width: 180px;
      display: inline-block;
      vertical-align: top;
      box-sizing: border-box;

      .alpheios-alignment-editor__page_list-link {
        cursor: pointer;
        margin: 0;
        padding: 10px 0;
        border-right: 2px solid #46788d;

        &.alpheios-active {
          font-weight: bold;
          color: #46788d;
        }
      }

      @media screen and (max-width: 800px) {
        display: block;
        width: 100%;
        padding: 20px;
        border-bottom: 2px solid #46788d;
        .alpheios-alignment-editor__page_list-link {
          border-right: none;
        }
      }
    }

    .alpheios-alignment-editor__page-content__right {
      padding: 33px 20px 20px 0;
      display: inline-block;
      width: calc(100% - 250px);
      vertical-align: top;
      box-sizing: border-box;

      @media screen and (max-width: 800px) {
        display: block;
        width: 100%;
        padding: 20px;
      }

      .alpheios-alignment-editor__page-content__info-block {
        background-color: #f1fafc;
        background-position: 10px 50%;
        background-repeat: no-repeat;
        background-size: 30px;
        color: #46788d;
        font-size: 95%;
        padding: 20px 20px 20px 50px;

        @media screen and (max-width: 800px) {
          background-position: 50% 10px;
          padding: 30px 20px 20px 20px;
          text-align: center;
        }
      }
        
      .alpheios-alignment-editor__page-content__item-img {
        text-align: center;
        img {
          display: inline-block;
          width: 70%;

          @media screen and (max-width: 800px) {
            width: 100%;
          }
        }
      }
      
      .alpheios-alignment-editor_table {
        border-collapse: collapse;
        tr:nth-child(even){background-color: #f2f2f2;}
        tr:hover {background-color: #ddd;}

        td {
          padding: 8px;
        }
      }
      .alpheios-alignment-editor_td1 {
        font-weight: bold;
      }
    }
  }

  .alpheios-alignment-editor__footer {
    background: #0E2233;
    padding: 40px 20px;
    color: #ffffff;

    .alpheios-alignment-editor__footer-inner {
      max-width: 1000px;
      width: 90%;
      margin: 0 auto;
    }

    .alpheios-alignment-editor__footer-copyright {
      text-align: right;
    }
  }
}
  .alpheios-alignment-editor-main-button-block {
    margin: 40px 0;
    text-align: center;

    a.alpheios-alignment-editor-main-button-link {
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

  .alpheios-alignment-editor__page-content__nav-links {
    margin: 20px 0;
    display: flex;
    justify-content: space-between;
    background: #eee;
    padding: 20px;

    span {
      display: block;
      color: #0E2233;
      font-weight: bold;
      cursor: pointer;
    }
  }

</style>