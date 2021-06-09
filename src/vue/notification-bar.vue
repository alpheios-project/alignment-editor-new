<template>
  <div class="alpheios-alignment-notification-bar" id="alpheios-notification-bar" v-if="messages && messages.length > 0">
      <div v-for="(message, mesIndex) in messages" :key="mesIndex"
           class="alpheios-alignment-notification-bar-message" :class="notificationClass(message)">
           {{ message.text }}
            <span
                class="alpheios-alignment-notification-bar__close-btn"
                @click="toggleShown(message)"
            >
                <close-icon/>
            </span>
      </div>
  </div>
</template>
<script>
import CloseIcon from '@/inline-icons/x-close.svg'

import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default {
  name: 'NotificationBar',
  components: {
    closeIcon: CloseIcon
  },
  data () {
    return {
    }
  },
  computed: {
    messages () {
      return Boolean(this.$store.state.alignmentUpdated) && this.$store.state.messages
    }
  },
  methods: {
    notificationClass (message) {
      return `alpheios-alignment-notification-bar-message___${message.type}`
    },
    toggleShown (message) {
      NotificationSingleton.removeNotification(message)
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-notification-bar {
        padding: 15px 15px 0;
        margin-left: 30px;

        .alpheios-alignment-notification-bar-message {
            padding: 10px 30px 10px 10px;
            border-radius: 15px;
            margin-bottom: 10px;
            border: 1px solid transparent;
            position: relative;
            
            .alpheios-alignment-notification-bar__close-btn {
                padding: 0 10px 0 20px;
                cursor: pointer;

                display: inline-block;
                position: absolute;
                top: 30%;
                right: 0;

                & svg {
                    width: 20px;
                    height: 20px;
                }
            }

            &.alpheios-alignment-notification-bar-message___system_error {
                background:rgba(198, 6, 35, 0.6);
                color: #fff;
                border-color: #c60623;

                .alpheios-alignment-notification-bar__close-btn {
                    fill: #c60623;
                    stroke: #c60623;

                    &:hover,
                    &:focus {
                        fill: #d1374e;
                        stroke:  #d1374e;
                    }

                    &:active {
                        fill:  #d1374e;
                        stroke:  #d1374e;
                    }
                }
            }

            &.alpheios-alignment-notification-bar-message___error {
                background:rgba(198, 73, 6, 0.6);
                color: #fff;
                border-color: #C64906;

                .alpheios-alignment-notification-bar__close-btn {
                    fill: #C64906;
                    stroke: #C64906;

                    &:hover,
                    &:focus {
                        fill: #F27431;
                        stroke:  #F27431;
                    }

                    &:active {
                        fill:  #F27431;
                        stroke:  #F27431;
                    }
                }
            }

            &.alpheios-alignment-notification-bar-message___info {
                background: #BCE5F0;
                color: #757575;
                border-color: #757575;

                .alpheios-alignment-notification-bar__close-btn {
                    fill: #757575;
                    stroke: #757575;

                    &:hover,
                    &:focus {
                        fill: #1B374F;
                        stroke:  #1B374F;
                    }

                    &:active {
                        fill:  #1B374F;
                        stroke:  #1B374F;
                    }
                }
            }


        }
    }
</style>
