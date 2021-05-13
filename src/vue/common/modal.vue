<template>
    <transition name="alpheios-modal">
        <div class="alpheios-modal-mask">
            <div class="alpheios-modal-wrapper">
            <div class="alpheios-modal-container">

                <div class="alpheios-modal-header">
                    <span class="alpheios-alignment-modal-close-icon" @click = "$emit('close')">
                        <x-close-icon />
                    </span>
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
import XCloseIcon from '@/inline-icons/x-close.svg'

export default {
  name: 'Modal',
  components: {
    xCloseIcon: XCloseIcon
  },
  props: {
  }
}
</script>
<style lang="scss">
  .alpheios-modal-header {
    position: relative;

    .alpheios-alignment-modal-close-icon {
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        width: 25px;
        height: 25px;
        cursor: pointer;

        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
    }
  }
</style>
