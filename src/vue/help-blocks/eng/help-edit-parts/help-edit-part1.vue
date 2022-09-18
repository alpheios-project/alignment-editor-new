<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-edit-content-part1">
    <p>After texts have been prepared for alignment, which requires their analysis into "tokens", 
      they cannot be edited directly, but can only be modified with this special Token Editor. 
      It is therefore advisable to review your texts carefully before pressing [DONE], which tokenizes them.
    </p>
    <p>Furthermore, any words that have already been aligned must be unlinked in the Align Text screen before 
      their tokens can be edited in this screen. If you try to edit tokens that are still aligned, 
      you will receive a message prompting you to unlink them first. 
    </p>
    <p>Clicking on a "token" on this screen will open a panel of editing icons
    (which you can reduce in number in the Options if you find you do not need some).
    </p>
    <p>By choosing the appropriate small icon (identifiable from their tool tips) you can then
    </p>
    <ul>
      <li>add or delete line breaks</li>
      <li>add or delete tokens (words or punctuation)</li>
      <li>merge adjacent tokens and subsequently split them again</li>
      <li>edit a token (e.g. correct the spelling of a word)
    (to save such editing changes you MUST click on the pencil icon to save it after making the change)</li>
    </ul>
    <p>All successful changes will be immediately visible in the Alignment Screen</p>
  </div>
</template>
<script setup>
import PlusIcon from '@/inline-icons/plus.svg'

</script>

<style lang="scss">
</style>