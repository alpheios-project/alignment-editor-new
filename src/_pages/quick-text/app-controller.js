import App from '@/_pages/quick-text/vue/app.vue'
import { createApp } from 'vue'

export default class AppController {
  constructor ({ appId }) {
    const app = createApp(App)
    app.mount(`#${appId}`) 
  }
}

