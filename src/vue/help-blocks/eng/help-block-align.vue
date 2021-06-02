<template>
  <div class="alpheios-editor-help-content">
      <h3>Alignment</h3>
      <p>Words in red are not aligned. At the start of a new alignment all the words will be red.</p>
      <p>To link words in the original text with those in translations, 
first select the word or words in in the original that that you want to link to some word or words in the translation. The selected words will turn green.
Then select the words in the translation that you wish to link to the words in the original. 
They will turn yellow as you select them.</p>
      <p>To actually establish the link you need to return to the original text and click on one of the
 selected words in green.</p>
      <p>They will then all turn yellow and the link will be established.</p>
      <p>Now when you mouse over linked text in either the original or the translation the corresponding text on the other
panel will be highlighted.</p>
      <p>The [UNDO] button will break the last link made, and the [REDO] button will reconnect it.</p>

      <h3>Entering or modifying a description of your text:</h3>
      <p>A red icon in the upper right corner of a text box indicates that no desciption of the text has been
made. Clicking on it will open the template for adding a description. Subsequently the icon will
turn green, which indicates that a desciption has been added. Clicking on it now will open the
template again in case some modification becomes necessary.</p>
      
      <h3>Exporting Text:</h3>
      <p>You have two different ways to export text:</p>
      <ul>
          <li>
            If you are finished with your alignment and just want to save it for subsequent display you can export it as HTML
 You will not be able to make any further changes to the links, but you will have several different ways to display
 them.      <ul>
                <li>as two panes just as you saw them when creating the links</li>
                <li>as three panes</li>
                <li>as just the sentence in which the word appears 
        or with a designated number of sentences around the target sentence</li>
                <li>as just the linked words without any context</li>
                <li>as an aggregation of all the equivalents per translation
          showing the number of times each different equivalent occurs in each translation</li>
            </ul>
          </li>
          <li>
              If you are not finished with your alignment or if you want to let someone else reedit your alignment, you can
 export it as a .json file that can be reuploaded directly into the alignment editor where changes in the alignments
 can be made as before.
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