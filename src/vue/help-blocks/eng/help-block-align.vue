<template>
  <div class="alpheios-editor-help-content">
      <h3>Alignment</h3>
      <p>Words in red are not aligned. At the start of a new alignment all the words will be red.</p>
      <p>To link words in the original text with those in translations, first select the word or words in the original 
        that you want to link to some word or words in the translation, 
        One of the selected words will turn green, while any others in the same alignment group will turn amber.</p>
      <p>Then select the words in the translation that you wish to link to the words in the original. 
         They will turn amber as you select them.</p>

      <p>To actually establish the link you need now to return to the original text and click on the word highlighted in green.</p>
      <p>They will then all turn amber and the link will be established.</p>
      <p>Now when you mouse over linked text in either the original or the translation the corresponding text on the other
panel will be highlighted.</p>
      <p>The [UNDO] button will break the last link made, and the [REDO] button will reconnect it. </p>
      <p>To undo previously established links you can click on one of the words on either side until it turns green, 
        then go to the panel on the other side and click on each linked word in turn, 
        only then returning to the side with the green word. Click on any other remnants of the link on this side and 
        then click on the green word itself.</p>
     <p>OR {special shortcut trick}</p>
     <p>You can just click on a word in the phrase to highlight it and then press page reload in the browser.
     When the page returns the phrases will no longer be linked.</p>
      <h3>Entering or modifying a description of your text</h3>
      <p>A red icon in the upper right corner of a text box indicates that no description of the text has been made. 
        Clicking on it will open the template for adding a description. Subsequently the icon will turn green, 
        which indicates that a description has been added. Clicking on it now will open the template 
        again in case some modification becomes necessary.</p>
      <p>In order to achieve comparable performance with texts of different sizes, only a specific maximum number of characters 
        is available for alignment any one moment. The default value is 1000 characters, but this value can be changed 
        in the Options tab of the Enter Text screen to better accommodate different screen sizes.</p>
      <p>If your text is larger than the size of this window, the next portion can be loaded with the "next" button 
        at the bottom of the current display. The existence of multiple portions will be shown as small horizontal 
        tiles at the top of the alignment screen, and after moving to the next one, 
        you can also move back with the "previous" button that will appear at the top of the new screen.</p>
      <p>Note that versions of the most recent alignments that can be resumed (in an alpheios json format) 
        appear when you choose the Resume Alignments option. Do not delete any from this list until you are certain 
        that you have saved them elsewhere or are sure you no longer need them. The deletion of this version cannot be undone.  
        But pruning it of outdated items occasionally may make it easier to keep track of different alignments.  
        Their accumulation will not actually affect performance, however, until they start to fill up your hard disk, 
        like any log file. </p>
      <p>You can add another translation even after you have begun aligning without losing the alignments you have made, 
        but you will have to return to the Enter Text Screen to do so and use the + sign to open a new box for 
        that new translation. You will then have to use the [Prepare Texts for Alignment] button again 
        to return to the alignment screen.  The alignments you have already made will not be lost. </p>
      <h3>SAVING LOCALLY:</h3>
      <p>You have two different formats for saving alignments on your machine.</p>
      <ul>
          <li>
             If you are not finished with your alignment or if you want to let someone else reedit your alignment, 
             you can export it as a json file that can be reuploaded directly into the alignment editor 
             where changes in the alignments can be made as before.
          </li>
          <li>
            If you are finished with your alignment and just want to save it for subsequent display you can export it as HTML
 You will not be able to make any further changes to the links, but you will have several different ways to display them: 
 <ul>
                <li>as two panes just as you saw them when creating the links</li>
                <li>as three panes</li>
                <li>as just the sentence in which the word appears 
        or with a designated number of sentences around the target sentence</li>
                <li>as just the linked words without any context</li>
                <li>as an aggregation of all the equivalents per translation showing the 
       number of times each different translation equivalent occurs in each 
       translation. How many times a given word or expression is used to 
       translate the same word or expression.</li>
            </ul>
          </li>

      </ul>
  </div>
</template>
<script>
export default {
  name: 'HelpBlockAlign'
}
</script>
<style lang="scss">

</style>