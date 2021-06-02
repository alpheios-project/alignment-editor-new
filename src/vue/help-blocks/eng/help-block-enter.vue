<template>
  <div class="alpheios-editor-help-content">
      <p>Alpheios expects you to enter text in the original language in the empty box on the left and translations in the box to the right.</p>
      <p>You can add any number of translations by clicking on the + sign and filling in each successive entry box.</p>
      <p>You can either type or cut and paste text into the text box or upload a file from your local machine. 
          Both plain text  and text that has been marked up with <a href="https://tei-c.org/" target="_blank">TEI XML</a> can be uploaded or pasted into the text entry box.
      </p>
      <p>You can also upload text through the DTS API from sites that support this standard.</p>
      <p>Uploaded files must have one of the following extensions: <b>.txt</b>, <b>.xml</b>, <b>.csv</b>, <b>.tsv</b>. (Plain text files with no extension will load if you add the .txt extension)</p>
      <p>Alpheios will stop with an error message if one attempts to upload a file with any other extension.</p>
      <p class="alpheios-editor-help-content-error">"Supported file types are only those with the extensions .txt, .xml, .csv, .tsv."</p>
      <p>The X in the upper right corner of the entry boxes will clear the text and any associated description and prepare the box to receive new text and be associated with a new description.</p>
      <p>If you want to clear everything from the current alignment session and return to the start of the text entry screen you can choose the [Start new alignment] button from the MENU.</p>
      <p>You can make any changes you wish to text in either the original text or translation boxes but after
  the "Prepare Texts for Alignment" button has been pressed, and you are taken to the "alignment" screen,
  changing texts will require returning to the Text Enter screen, making the desired changes, and then
  preparing the texts for alignment again.</p>
      <p>The amount of text that can be entered in a single session is limited to improve performance. The 
  optimal amount will depend on the resources available on your local machine and can be adjusted
  in the enter text OPTIONS tab.</p>
      <p>You can use the [DESCRIBE] button below the text entry boxes to enter information about the text.
  If you do not do this on the ENTER TEXT screen a red icon will appear above the text boxes in the 
  ALIGN TEXT screen to remind you to do so. Clicking on that icon will bring up the same template that
  the DESCRIBE button provides from this screen and turns the icon green. To modify this information
  subsequently, click on the green icon to return to the description template for modification.
  There is no minimum requirement for this information.</p>
      <p>Alpheios will attempt to detect the language of both original text and and translations as well as whether
  the text has TEI XML markup. It will ask you to confirm or correct this information just before 
  preparing the texts for alignment.</p>
       <p>[SAVE LOCALLY] Allows you to save the texts you have input but not yet prepared for aligment in case
  you want to continue later on this or another computer. They will be saved in a .json format suitable only for
  reuploading into this application.</p>
       <p>The [OPTIONS] button:</p>
       <ul>
        <li>Change a style-sheet theme for the entire application.</li>
        <li>Set a limit for the amount of text that the application will accept for each alignment session.
  The more text you enter the greater the demands on your locale computer and you may notice an effect on
  performance. Set a lower limit to resolve this problem. </li>
        <li>Choose to use an online service for tokenizing and language detection.</li>
        <li>If you wish Choose to work entirely offline:
            <ul>
                <li>using a local tokenizer to prepare the text for alignment</li>
                <li>identifying the language manually</li>
            </ul>
        </li>
        <li>The tokenizer that prepares the texts for alignment and the automatic language detection are the
  only steps requiring internet connectivity. The rest of the application can be used without it.</li>
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