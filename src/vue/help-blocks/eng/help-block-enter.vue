<template>
  <div class="alpheios-editor-help-content">
      <p>Alpheios expects you to enter text in the original language in the empty box on the left and a translation in the box to the right.</p>
      <p>You can add any number of translations by clicking on the + sign and filling in each successive entry box.</p>
      <p>You can either type or cut and paste text into the text box or upload a file from your local machine.
         Both plain text and text that has been marked up with <a href="https://tei-c.org/" target="_blank">TEI XML</a> 
         can be uploaded or pasted into the text entry box.  
      </p>
      <p>You can also upload text through the DTS API from sites that support this standard.</p>
      <p>Uploaded files must have one of the following extensions: <b>.txt</b>, <b>.xml</b>, <b>.csv</b>, <b>.tsv</b>. 
         (Plain text files with no extension will load if you add the .txt extension)</p>
      <p>Alpheios will stop with an error message if one attempts to upload a file with any other extension.</p>
      <p class="alpheios-editor-help-content-error">"Supported file types are only those with the extensions .txt, .xml, .csv, .tsv."</p>
      <p>You can enter quite large files through this screen, if necessary an entire book, but remember that you are storing
  everything on your local computer. Large texts are automatically divided into smaller units for display in an
  "editing window" whose size is intended to optimize performance during alignment. Alignment can only be performed on text
  currently visible in this editing window (whose size can be adjusted in the Options tab). Successive portions of the
  text are loaded with the "Next" button at the bottom of the screen, while previous portions can be recalled with the
  "Previous" button at the top.  You might wish to adjust the size of this window to adapt the display to the size of
  your screen. Since performance is affected by the total number of characters present in this window, including those
  in all the translations you are aligning simultaneously, you may discover that with large numbers of translations
  performance can be improved by reducing the size of this window. It is difficult to provide more specific 
  guidance here because actual performance depends on the resources available on your local machine, especially the
  amount of RAM. In our experience a window of 1000 characters per translation should provide acceptable performance
  with more than a dozen simultaneously aligned translations on a machine with eight megabytes of RAM.</p>
      <p>Previous alignments that have been saved as json files can be uploaded with the Resume Previous Alignment button.
  It provides the option of choosing the file from your local file system or from a list of recently saved alignments.
  Like any log file this list is most useful when occasionally pruned of items no longer needed. But be careful to
  save any files you may need elsewhere, because deletion from this list is final.</p>

      <p>The X in the upper right corner of the entry boxes will clear the text and any associated description and 
  prepare the box to receive new text and a new description.</p>
      <p>If you want to clear everything from the current alignment session and start over you can choose the
           [Start new alignment] button from the MENU in the upper left of the screen.</p>
      <p>You can make any changes you wish to text in either the original text or translation boxes on this Enter screen, 
          but after the "Prepare Texts for Alignment" button has been pressed, and you are taken to the "Align" screen, 
          altering texts will be more difficult. If you only need to make minor changes like correcting the spelling of a word, 
          or adding or deleting line breaks, you can do that with the Edit Text screen. 
          (See Help page for the Edit Text screen.) But if you need to make major changes like adding or deleting words, 
          you will have to re-enter the changed text on the Enter Text screen and use the Prepare Text button again.</p>
      <h3>The [DESCRIBE] button</h3>
      <p>You can use the [DESCRIBE] button below the text entry boxes to enter information about the text. 
          If you do not do this on the ENTER TEXT screen a red icon will appear above the text boxes in the ALIGN TEXT screen 
          to remind you to do so. Clicking on that icon will bring up the same template that the DESCRIBE button provides 
          from this screen and turns the icon green. To modify this information subsequently, click on the green icon 
          to return to the description template for modification.  There is no minimum requirement for this information.</p>
      <p>Alpheios will attempt to detect the language of both original text and and translations as well 
          as whether the text has TEI XML markup. It will ask you to confirm or correct this information 
          just before preparing the texts for alignment.</p>
       <p>[SAVE LOCALLY] button:  Allows you to save the texts you have input but not yet prepared for alignment in case 
           you want to continue later on this or another computer. They will be saved in a jason format suitable only for 
           reuploading into this application.</p>
       <h3>The [OPTIONS] button:</h3>
       <ul>
        <li>Change a style-sheet theme for the entire application.</li>
        <li>Set a size limit for the display of text during alignment. The more text in this editing window, 
            the greater the demands on your local computer and you may notice an effect on performance. 
            Set a lower limit to resolve this problem.</li>
        <li>Choose to use an online service for tokenizing and language detection.</li>
        <li>The tokenizer that prepares the texts for alignment and the automatic language detection are 
            the only steps requiring internet connectivity. The rest of the application can be used without it.
        </li>
        <li>If you wish to work entirely offline:
            <ul>
                <li>using a local tokenizer to prepare the text for alignment</li>
                <li>identify the language manually</li>
            </ul>
        </li>
       </ul>
  </div>
</template>
<script>
export default {
  name: 'HelpBlockEnter'
}
</script>
<style lang="scss">
.alpheios-editor-help-content {
  text-indent: 10px;
  text-align: justify;
  

  .alpheios-editor-help-content-error {
      color: #f00;
      font-weight: bold;
  }
}
</style>