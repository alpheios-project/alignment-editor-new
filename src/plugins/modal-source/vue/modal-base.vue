<template>
  <div v-if="visible" class="vm--container">
    <Transition
      :name="guaranteedOverlayTransition"
      @before-enter="beforeOverlayTransitionEnter"
      @after-enter="afterOverlayTransitionEnter"
      @before-leave="beforeOverlayTransitionLeave"
      @after-leave="afterOverlayTransitionLeave"
      appear
    >
      <div class="vm--overlay" v-if="visibility.overlay" @click.self.stop="onOverlayClick">
      </div>
    </Transition>
    <Transition
      :name="guaranteedModalTransition"
      @before-enter="beforeModalTransitionEnter"
      @after-enter="afterModalTransitionEnter"
      @before-leave="beforeModalTransitionLeave"
      @after-leave="afterModalTransitionLeave"
      appear
    >
      <div v-if="visibility.modal"
          ref="modalref"
          class="vm--modal"
          :style="modalStyle"
          role="dialog"
          aria-modal="true"
      >
          <div class="vue-modal-content">
              <slot />
          </div>
      </div>
    </Transition>
  </div>
</template>
<script>
import { parseNumber, validateNumber, windowWidthWithoutScrollbar, getTouchEvent, isInput, inRange } from '@/plugins/modal-source/utils.js'

import { inject, onBeforeMount, onMounted, onBeforeUnmount, reactive, ref, computed, toRefs, watchEffect, watch, nextTick } from 'vue'

export default {
  props: {
    modalName: {
      required: true,
      type: String
    },
    clickToClose: {
      type: Boolean,
      default: true
    },
    adaptive: {
      type: Boolean,
      default: false
    },
    minWidth: {
      type: Number,
      default: 0,
      validator(value) {
        return value >= 0
      }
    },
    minHeight: {
      type: Number,
      default: 0,
      validator(value) {
        return value >= 0
      }
    },
    maxWidth: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER
    },
    maxHeight: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER
    },
    width: {
      type: [Number, String],
      default: 600,
      validator(value) {
        return value === 'auto' || validateNumber(value)
      }
    },
    height: {
      type: [Number, String],
      default: 300,
      validator(value) {
        return value === 'auto' || validateNumber(value)
      }
    },
    reset: {
      type: Boolean,
      default: false
    },
    
    shiftX: {
      type: Number,
      default: 0.5,
      validator(value) {
        return value >= 0 && value <= 1
      }
    },
    shiftY: {
      type: Number,
      default: 0.5,
      validator(value) {
        return value >= 0 && value <= 1
      }
    },
    draggable: {
      type: [Boolean, String],
      default: true
    }
  },
    setup (props, { emit }) {

    const $modal = inject('$modal')

    $modal.on('showModal', (data) => {
      if (props.modalName === data.modalName) {
        onToggle(true, data)
      }
    })

    $modal.on('hideModal', (data) => {
      if (props.modalName === data.modalName) {
        onToggle(false, data)
      }
    })

    const state = reactive({ 
      visible: false,

      visibility: {
        modal: false,
        overlay: false
      },
      viewportHeight: 0,
      viewportWidth: 0,
      shiftLeft: 0,
      shiftTop: 0,
      shiftX: 0.5,
      shiftY: 0.5,
      modal: {
        width: 0,
        widthType: 'px',
        height: 0,
        heightType: 'px',
        renderedHeight: 0
      },

      guaranteedOverlayTransition: 'vm-transition--overlay',
      guaranteedModalTransition: 'vm-transition--modal',

      overlayTransitionState: null,
      modalTransitionState: null
    })

    const modalref = ref(null)

    const TransitionState = {
      Enter: 'enter',
      Entering: 'entering',
      Leave: 'leave',
      Leaving: 'leavng'
    }

    onMounted(() => {
      state.viewportWidth = windowWidthWithoutScrollbar()
      state.viewportHeight = window.innerHeight

      window.addEventListener('resize', onWindowResize)
    })

    const onWindowResize = () => {
      state.viewportWidth = windowWidthWithoutScrollbar()
      state.viewportHeight = window.innerHeight
    }

    
    const setInitialSize = () => {
      const width = parseNumber(props.width)
      const height = parseNumber(props.height)

      state.modal.width = width.value
      state.modal.widthType = width.type
      state.modal.height = height.value
      state.modal.heightType = height.type
    }

    const autoHeight = computed(() => {
      return props.adaptive && state.modal.renderedHeight >= state.viewportHeight
        ? Math.max(props.minHeight, state.viewportHeight) + 'px'
        : 'auto'
    })

    const isAutoHeight = computed(() => {
      return state.modal.heightType === 'auto'
    })

    const trueModalWidth = computed(() => {
      const { viewportWidth, modal } = state

      const { adaptive, minWidth, maxWidth } = props

      const value =
        modal.widthType === '%'
          ? (viewportWidth / 100) * modal.width
          : modal.width

      if (adaptive) {
        const max = Math.max(minWidth, Math.min(viewportWidth, maxWidth))
        return inRange(minWidth, max, value)
      }

      return value
    })

    const trueModalHeight = computed(() => {
      const { viewportHeight, modal } = state

      const {
        adaptive,
        minHeight,
        maxHeight
      } = props

      const value =
        modal.heightType === '%'
          ? (state.viewportHeight / 100) * modal.height
          : modal.height

      if (isAutoHeight.value) {
        // use renderedHeight when height 'auto'
        return state.modal.renderedHeight
      }

      if (adaptive) {
        const max = Math.max(minHeight, Math.min(viewportHeight, maxHeight))

        return inRange(minHeight, max, value)
      }

      return value
    })

    const position = computed(() => {
      const {
        viewportHeight,
        viewportWidth,
        shiftLeft,
        shiftTop
      } = state

      const {
        shiftX,
        shiftY
      } = props

      const maxLeft = viewportWidth - trueModalWidth.value
      const maxTop = Math.max(viewportHeight - trueModalHeight.value, 0)

      const left = shiftLeft + shiftX * maxLeft
      const top = shiftTop + shiftY * maxTop

      return {
        left: parseInt(inRange(0, maxLeft, left)),
        top:
          !trueModalHeight.value && isAutoHeight
            ? undefined
            : parseInt(inRange(0, maxTop, top))
      }
    })

    const modalStyle = computed(() => {
      return [
        {
          top: position.value.top + 'px',
          left: position.value.left + 'px',
          width: trueModalWidth.value + 'px',
          height: isAutoHeight.value
            ? autoHeight.value
            : trueModalHeight.value + 'px'
        }
      ]
    })


    const onEscapeKeyUp = (event) => {
      if (event.which === 27 && state.visible) {
        close()
        return
      }
    }

    const onToggle = (state, params) => {      
      const nextState = typeof state === 'undefined' ? !state.visible : state

      toggle(nextState, params)
    }

    const toggle = (isOpening, params) => {
      const { visible } = state

      if (visible === isOpening) {
        return
      }

      if (isOpening) {
        open(params)
      } else {
        close(params)
      }
    }
    
    const startTransitionEnter = () => {
      state.visibility.overlay = true
      state.visibility.modal = true
    }

    const startTransitionLeave = () => {
      state.visibility.overlay = false
      state.visibility.modal = false
    }

    const open = async (params) => {
      if (props.reset) {
        setInitialSize()

        state.shiftLeft = 0
        state.shiftTop = 0
      }

      let cancelEvent = false

      const cancel = () => {
        cancelEvent = true
      }

      emit('before-open', { params })

      if (cancelEvent) {
        return
      }

      // blurActiveElement()

      state.visible = true
      
      /* Making sure that entering tranition uses "enter" sequance instead of "appear" */

      startTransitionEnter()
      await nextTick()

      if (modalref.value && !state.modal.renderedHeight) {
        const clientRect = modalref.value.getBoundingClientRect() 
        state.modal.renderedHeight = clientRect ? clientRect.height : null
      }
    }

    const close = (params) => {
      let cancelEvent = false

      const cancel = () => {
        cancelEvent = true
      }

      emit('before-close', { params })

      if (cancelEvent) {
        return
      }

      startTransitionLeave()
    }

    onBeforeMount( () => {
      if (props.clickToClose) {
        window.addEventListener('keyup', onEscapeKeyUp)
      }
    })

    onMounted( () => {
       setInitialSize()
    })

    onBeforeUnmount(() => {
      if (props.clickToClose) {
        window.removeEventListener('keyup', onEscapeKeyUp)
      }
      document.body.classList.remove('vm--block-scroll')
    })

    const isComponentReadyToBeDestroyed = computed(() => {
      return (
        state.overlayTransitionState === TransitionState.Leave &&
        state.modalTransitionState === TransitionState.Leave
      )
    })

    watchEffect (() => {
      if (isComponentReadyToBeDestroyed.value) {
        state.visible = false
      }
    })

    const onOverlayClick = () => {
      toggle(false)
    }


    const beforeOverlayTransitionEnter = () => {
      state.overlayTransitionState = TransitionState.Entering
    }

    const afterOverlayTransitionEnter = () => {
      state.overlayTransitionState = TransitionState.Enter
    }

    const beforeOverlayTransitionLeave = () => {
      state.overlayTransitionState = TransitionState.Leaving
    }

    const afterOverlayTransitionLeave = () => {
      state.overlayTransitionState = TransitionState.Leave
    }

    const beforeModalTransitionEnter = () => {
      state.modalTransitionState = TransitionState.Entering
    }

    const afterModalTransitionEnter = () => {
      /* Setup resize ovserver */
      state.modalTransitionState = TransitionState.Enter

      if (props.draggable) {
        addDraggableListeners()
      }
    }

    const beforeModalTransitionLeave = () => {
      state.modalTransitionState = TransitionState.Leaving
    }

    const afterModalTransitionLeave = () => {
      state.modalTransitionState = TransitionState.Leave
    }
   
    const getDraggableElement = () => {
      if (props.draggable === true) {
        return modalref.value
      }
      return null
    }

    const addDraggableListeners = () => {
      const dragger = getDraggableElement()

      if (dragger) {
        let startX = 0
        let startY = 0
        let initialShiftLeft = 0
        let initialShiftTop = 0

        const handleDraggableMousedown = event => {
          
          let target = event.target

          if (isInput(target)) {
            return
          }

          let { clientX, clientY } = getTouchEvent(event)

          document.addEventListener('mousemove', handleDraggableMousemove)
          document.addEventListener('touchmove', handleDraggableMousemove)

          document.addEventListener('mouseup', handleDraggableMouseup)
          document.addEventListener('touchend', handleDraggableMouseup)

          startX = clientX
          startY = clientY

          initialShiftLeft = state.shiftLeft
          initialShiftTop = state.shiftTop
        }

        const handleDraggableMousemove = event => {
          let { clientX, clientY } = getTouchEvent(event)

          state.shiftLeft = initialShiftLeft + clientX - startX
          state.shiftTop = initialShiftTop + clientY - startY

          event.preventDefault()
        }

        const handleDraggableMouseup = event => {
          ensureShiftInWindowBounds()

          document.removeEventListener('mousemove', handleDraggableMousemove)
          document.removeEventListener('touchmove', handleDraggableMousemove)

          document.removeEventListener('mouseup', handleDraggableMouseup)
          document.removeEventListener('touchend', handleDraggableMouseup)

          event.preventDefault()
        }

        dragger.addEventListener('mousedown', handleDraggableMousedown)
        dragger.addEventListener('touchstart', handleDraggableMousedown)
      }
    }

    const ensureShiftInWindowBounds = () => {
      const {
        viewportHeight,
        viewportWidth,
        shiftLeft,
        shiftTop
      } = state

      const {
        shiftX,
        shiftY
      } = props

      const maxLeft = viewportWidth - trueModalWidth.value
      const maxTop = Math.max(viewportHeight - trueModalHeight.value, 0)

      const left = shiftLeft + shiftX * maxLeft
      const top = shiftTop + shiftY * maxTop

      state.shiftLeft -= left - inRange(0, maxLeft, left)
      state.shiftTop -= top - inRange(0, maxTop, top)
    }

    return {...toRefs(state), ...{ modalStyle, close, modalref, onOverlayClick,  
      beforeOverlayTransitionEnter,
      afterOverlayTransitionEnter,
      beforeOverlayTransitionLeave,
      afterOverlayTransitionLeave,
      
      beforeModalTransitionEnter,
      afterModalTransitionEnter,
      beforeModalTransitionLeave,
      afterModalTransitionLeave
    }}
  }
}
</script>

<style>
.vm--block-scroll {
  overflow: hidden;
  width: 100vw;
}

.vm--container {
  position: fixed;
  box-sizing: border-box;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 999;
}

.vm--overlay {
  position: fixed;
  box-sizing: border-box;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  /* z-index: 999; */
  opacity: 1;
}

.vm--container.scrollable {
  height: 100%;
  min-height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.vm--modal {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  background-color: white;
  border-radius: 3px;
  box-shadow: 0 20px 60px -2px rgba(27, 33, 58, 0.4);

  padding: 20px;
}

.vue-modal-content {
  height: 100%;
}
.vm--container.scrollable .vm--modal {
  margin-bottom: 2px;
}

.vm--top-right-slot {
  display: block;
  position: absolute;
  right: 0;
  top: 0;
}

.vm-transition--overlay-enter-active,
.vm-transition--overlay-leave-active {
  transition: all 50ms;
}

.vm-transition--overlay-enter-from,
.vm-transition--overlay-leave-to {
  opacity: 0;
}

.vm-transition--modal-enter-active,
.vm-transition--modal-leave-active {
  transition: all 400ms;
}

.vm-transition--modal-enter-from,
.vm-transition--modal-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.vm-transition--default-enter-active,
.vm-transition--default-leave-active {
  transition: all 2ms;
}

.vm-transition--default-enter,
.vm-transition--default-leave-active {
  opacity: 0;
}
</style>
