import ModalBase from "@/plugins/modal-source/vue/modal-base.vue"
import mitt from 'mitt'

export default {
  install: (app, options) => {
    const emitter = mitt()
    app.provide('$modal', {
      on: emitter.on.bind(emitter),
      emit: emitter.emit.bind(emitter),

      show: (modalName, params) => {
        emitter.emit('showModal', Object.assign({ modalName }, params))
      },
      hide: (modalName) => {
        emitter.emit('hideModal', { modalName })
      }
    })

    app.component("modal-base", ModalBase)

    // app.config.globalProperties.$modalTest = () => {
    //   console.info('Modal test')
    // }
  }
}
