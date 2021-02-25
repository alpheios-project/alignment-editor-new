<template>
    <transition name="alpheios-modal">
        <div class="alpheios-modal-mask">
            <div class="alpheios-modal-wrapper">
            <div class="alpheios-modal-container">

                <div class="alpheios-modal-header">
                <slot name="header"></slot>
                </div>

                <div class="alpheios-modal-body">
                <slot name="body"></slot>
                </div>

                <div class="alpheios-modal-footer">
                <slot name="footer"></slot>
                </div>
            </div>
            </div>
        </div>
    </transition>
</template>
<script>
export default {
  name: 'Modal',
  props: {
  }
}
</script>