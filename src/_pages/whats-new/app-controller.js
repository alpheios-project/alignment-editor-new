import Splide from '@splidejs/splide'

export default class AppController {
  constructor ({ splideId }) {
    new Splide(`#${splideId}`, {
      autoplay: true,
      interval: 3000,
      pauseOnHover: true
    }).mount()
  }
}
