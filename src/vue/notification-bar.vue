<template>
  <div class="alpheios-alignment-notification-bar" id="alpheios-notification-bar" 
       :class = "notificationBarClass"
       v-if="messages && messages.length > 0">
      <div v-for="(message, mesIndex) in messages" :key="mesIndex"
           class="alpheios-alignment-notification-bar-message" :class="notificationClass(message)">
           {{ message.text }}
            <span
                class="alpheios-alignment-notification-bar__close-btn"
                @click="hideMessage(message, true)"
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
      hideMessageFlag: false,
      hideTimeout: null
    }
  },
  computed: {
    messages () {
      const items = Boolean(this.$store.state.notificationUpdated) && this.$store.state.messages
      if (items && items.length > 0) {
        this.hideTimeout = setTimeout(() => {
            this.hideMessageBar()
        }, 12000)
      }
      return items
    },
    notificationBarClass () {
      return {
        'alpheios-invisible': this.hideMessageFlag
      }
    }
  },
  methods: {
    notificationClass (message) {
      return {
        [`alpheios-alignment-notification-bar-message___${message.type}`]: true
      }
    },
    hideMessageBar () {
      this.hideMessageFlag = true
      setTimeout(() => {
        this.messages.forEach(message => this.hideMessage(message))
        this.hideMessageFlag = false
      }, 2000)
    },
    hideMessage (message, clearTimeoutFlag = false) {
      if (clearTimeoutFlag) {
        clearTimeout(this.hideTimeout)
      }
      NotificationSingleton.removeNotification(message)
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-notification-bar {
        padding: 15px 15px 0;
        // margin-left: 30px;
        position: fixed;
        width: 100%;
        top: 25px;
        transition: opacity 2s ease-out;

        &.alpheios-invisible {
            opacity: 0;
        }

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
                background: #38cef6;
                color: #fff;
                border-color: #38cef6;

                .alpheios-alignment-notification-bar__close-btn {
                    fill: #323232;
                    stroke: #323232;

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
