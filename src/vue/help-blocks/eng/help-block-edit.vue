<template>
  <div class="alpheios-editor-help-content">
    <p>After texts have been prepared for alignment, which involves their analysis into "tokens", 
      they cannot be edited directly, but can only be modified with the special "Token Editor", 
      which has its own screen. It is therefore advisable to review the texts carefully 
      before preparing them for alignment by tokenization.
    </p>
    <p>Furthermore, any words that have already been aligned must be unlinked in the alignment screen 
      before their tokens can be edited in any way in the edit screen. If you try to edit them 
      you will receive a message prompting you to unlink them first. 
    </p>
    <p>What you can still do: (by clicking on a word to bring up the small options icons)</p>
    <ul>
      <li>you can add or delete line breaks (by choosing the appropriate small icon)</li>
      <li>you can correct the spelling of a word (by making the change and then clicking on the pencil icon to save the change)</li>
      <li>you can merge two adjacent words and subsequently split them again (by choosing the appropriate small icon)</li>
    </ul>
    <p>What you cannot do after "tokenization" or during alignment:</p>
    <ul>
      <li>you cannot add or delete a word except at the beginning or end of whatever text you tokenized 
        If you need to do so you will have to re-enter your text on the Text Enter Screen and retokenize with the 
        "Prepare Texts for Alignment" button.
      </li>
    </ul>
    <p>All successful changes will be immediately visible in the Alignment Screen</p>
  </div>
</template>
<script>
export default {
  name: 'HelpBlockEdit'
}
</script>
<style lang="scss">

</style>