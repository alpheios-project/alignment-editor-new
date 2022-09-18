<template>
  <modal-base modalName="waiting" height="auto">
    <div class="alpheios-alignment-editor-modal-waiting">
      <div class="alpheios-modal-body alpheios-editor__waiting">
          <span class="alpheios-editor__waiting-gif"><img src="images/waiting.gif" /></span>
      </div>
    </div>
  </modal-base>
</template>
<script setup>
</script>
<style lang="scss">
  .alpheios-alignment-editor-modal-waiting {
    .alpheios-modal-body {
      border: 0;
      padding: 10px 0;
    }

    .alpheios-editor__waiting {
        text-align: center;

        .alpheios-editor__waiting-gif {
            display: inline-block;
            width: 50px;
            height: 50px;

            img {
                width: 100%;
                height: 100%;
                display: block;
            }
        }
    }
  }
</style>