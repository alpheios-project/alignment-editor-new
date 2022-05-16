<template>
  <div class="alpheios-alignment-separate-page alpheios-alignment-quick-start" id="alpheios-quick-start" >
      <div class="alpheios-alignment-editor__intro">
        <div class="alpheios-alignment-editor__page-container">
          <div class="alpheios-alignment-editor__page-header">
            <div class="alpheios-alignment-editor__page-header-title">
              <span class="alpheios-alignment-editor-big-icon">
                <books-icon />
              </span>
              <h2 class="alpheios-alignment-editor__page-title"> Quick Start Text </h2>
            </div>
            <div class="alpheios-header-logo">
              <router-link to="/">
                <img src="images/alpheios-logo-black-2.png" class="alpheios-logo">
              </router-link>
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
                <p>Go to the website XXXXXX and click on Alpheios Alignment Editor. The libraries the editor needs will be loaded into your browser, where they will remain until you clear your cache.</p>
                <p>The application will then prompt you to give a name to this alignment and open the initial screen, the ENTER TEXT screen.</p>

                <p class="alpheios-alignment-editor__page-content__item-img"><img :src="newAlignmentTitlePNG"></p>
                <p>Although you can work offline during the actual alignment, you must begin with this download. It is also a good idea to stay online until after you have entered the text you want 
                  to align and the alignment editor has taken advantage of remote services to identify the language and tokenize the text accordingly to prepare it for alignment.</p>

                <div class="alpheios-alignment-editor__page-content__info-block" style="background-image: url('images/i-sign.svg')">
                  <p>If you find that you prefer to save and resume your work frequently, you may wish to download the XXXXX file from the alpheios site. 
                    Then you will not have to connect to the internet every time you resume an alignment since your text is already tokenized and its language has already been detected.</p>
                </div>
              </div><!-- alpheios-alignment-editor__page-content__item -->

              <div class="alpheios-alignment-editor__page-content__item" v-show="shownLink === 'entering-text'">
                <p>You can type or paste text into the two empty boxes on this screen or upload files. Large files will automatically be split into smaller parts for convenient display. 
                  Both plain text and text with markup such as XML can be entered.</p>
                <p>You can add any number of additional translations with the + button.</p>
                <p class="alpheios-alignment-editor__page-content__item-img"><img :src="enterTextScreenPNG"></p>
                <p>When you have finished entering text, the DONE button will tell the application to prepare the text for alignment by tokenizing it.</p>
                <p>Alignment can only performed on the ALIGN TEXT screen, which comes up next.</p>
              </div><!-- alpheios-alignment-editor__page-content__item -->

              <div class="alpheios-alignment-editor__page-content__item" v-show="shownLink === 'aligning'">
                <h4>To link words or phrases</h4>
                <p>To align words or phrases in one language with those in another:</p>
                <ul>
                  <li>Enter text from one language in the box on the left and text from the other in the box on the right.</li>
                  <li>Click on the all the words in the first language that you want to make part of an alignment, turning them green- indicating that an alignment has started.</li>
                  <li>Go to the other box and click on all the words you want to make part of the same alignment link, turning them amber.</li>
                  <li>Return to the initial language box and click on any green word to establish the alignment link, turning all the words that are part of that link black in both languages.</li>
                </ul>
                <p class="alpheios-alignment-editor__page-content__item-img"><img :src="alignScreenTextPNG"></p>
                <p>Now when you mouse over any word in that alignment group in either language, the whole alignment link will be highlighted in both languages.</p>

                <h4>To unlink</h4>
                <ul>
                  <li>Click on a word in an alignment group in either entry box, turning all its words green.</li>
                  <li>Go to the entry box on the other side and click on each of the aligned words in turn, turning them red.</li>
                  <li>Return to the first box and click on all the remaining words in the alignment link.</li>
                </ul>
                <p>All the words in the alignment group should now have returned to their original red color, indicating that they are not aligned.</p>

                <h4>Available actions</h4>
                <p>To add an annotation to a word, CTL-click on it in Windows and CMD-click on a MAC.</p>
                <p class="alpheios-alignment-editor__page-content__item-img"><img :src="newAnnotationPNG"></p>
                <p>To look up a word with the Alpheios reading tools, you can SHIFT-click on it whenever you are online.</p>
                <p>To edit text after it has been tokenized, enable the TOKEN EDITOR in the ALIGN TEXT options, and make the necessary changes on the TOKEN EDITOR screen. 
                  Your changes will also be shown when you return to the ALIGN TEXT screen.</p>

              </div><!-- alpheios-alignment-editor__page-content__item -->

              <div class="alpheios-alignment-editor__page-content__item" v-show="shownLink === 'saving'">
                <p>By default the application automatically saves a current copy of your work, which should protect it against sudden loss of power or other unpredictable interruptions, 
                  as well as provide a reliably current version for resuming where you left off.</p>
                <p>At any point in the alignment you can also save your work yourself, choosing JSON format if you are unfinished or think you may want to modify the alignment in the future, 
                  or the final HTML format, which gives you multiple display options, but cannot easily be edited.</p>
                <p class="alpheios-alignment-editor__page-content__item-img"><img :src="savingPNG"></p>
                <ul>
                  <li>the <b>JSON</b> version can only be resumed by some copy of the alpheios alignment editor</li>
                  <li>the <b>HTML</b> version can be displayed reliably by Chrome, Firefox and Safari.</li>
                </ul>
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
                    <td>permits multiple translations to display if you so choose</td>
                  </tr>
                  <tr>
                    <td class="alpheios-alignment-editor_td1">context</td>
                    <td>the sentence context in which the alignment occurs; by default one sentence</td>
                  </tr>
                </table>
                <p>A menu at the upper left of the screen lets you choose which translations should participate in the display and their sequence.</p>
                <p>By default all available translations will participate in the short and equivalents displays.</p>
              </div><!-- alpheios-alignment-editor__page-content__item -->
              
            </div><!-- alpheios-alignment-editor__page-content__right -->
          </div><!-- alpheios-alignment-editor__page-content -->
        </div><!-- alpheios-alignment-editor__page-container -->
      </div>
  </div>
</template>
<script>
import DocumentUtility from '@/lib/utility/document-utility.js'
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
  beforeRouteEnter(to, from, next) {  
   DocumentUtility.setPageClassToBody('quick-start')
    next()
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style lang="scss">
.alpheios-alignment-quick-start { 
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
      font-size: 70px;
      padding: 50px 0 0 30px;
      text-align: right;
      vertical-align: middle;
      line-height: 1;
    }
  }
  .alpheios-alignment-editor__page-container {
    width: 1000px;
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

    .alpheios-alignment-editor__page-content__left {
      padding: 40px 20px;
      width: 180px;
      display: inline-block;
      vertical-align: top;

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
    }

    .alpheios-alignment-editor__page-content__right {
      padding: 33px 20px 20px 0;
      display: inline-block;
      width: calc(100% - 190px);
      vertical-align: top;

      .alpheios-alignment-editor__page-content__info-block {
        background-color: #f1fafc;
        background-position: 10px 50%;
        background-repeat: no-repeat;
        background-size: 30px;
        color: #46788d;
        font-size: 95%;
        padding: 20px 20px 20px 50px;
      }
        
      .alpheios-alignment-editor__page-content__item-img {
        text-align: center;
        img {
          display: inline-block;
          width: 70%;
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
}


</style>
