import YTPlayer from 'yt-player'

const youtubeSrcList = ['WaLMw7XYhtc', 'TZa86G1uVOU']

export default class AppController {
  constructor ({ videoContainer }) {
    this.embedYoutubeVideos(videoContainer)
  }

  embedYoutubeVideos (videoContainer) {
    const container = document.getElementById(videoContainer)

    youtubeSrcList.forEach(youtubeSrc => {
      const id = this.getYoutubeItemId(youtubeSrc)
      const div = document.createElement('div')
      div.setAttribute('id', id)
      div.setAttribute('class', 'alpheios-alignment-editor__page-content-item')
      container.appendChild(div)
      this.uploadYoutubeVideo(youtubeSrc)
    })
  }

  getYoutubeItemId (youtubeSrc) {
    return `alpheios-alignment-editor-youtube-${youtubeSrc}`
  }

  uploadYoutubeVideo (youtubeSrc) {
    try {
      const player = new YTPlayer(`#${this.getYoutubeItemId(youtubeSrc)}`, {
        autoplay: false,
        related: false,
        modestBranding: true,
        host: 'https://www.youtube-nocookie.com'
      })
      player.load(youtubeSrc)
    } catch (error) {
      // console.error(error.message)
    }
  }
}
