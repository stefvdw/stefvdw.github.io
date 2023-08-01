export default class BaseCanvas extends HTMLCanvasElement {

    fullscreen = false
    wakelock = false
    frame = null
    originalSize = {}

    constructor() {
        super()
        this.ctx = this.getContext("2d")
    }

    connectedCallback() {
        this.addEventListener('fullscreenchange', this.handleFullscreen.bind(this))
        this.addEventListener('click', this.start.bind(this))
    }

    start() {
        this.removeEventListener('click', this.start.bind(this))
        if(this.fullscreen) {
            this.requestFullscreen()
        }
    }

    stop() {
        this.addEventListener('click', this.start.bind(this))

        if(this == document.fullscreenElement) {
            document.exitFullscreen()
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height)
    }

    log(message) {
        this.dispatchEvent(new CustomEvent('log', {detail: message}))
    }

    handleFullscreen(event) {
        if(event.target == document.fullscreenElement) {
            this.originalSize.width = this.width
            this.originalSize.height = this.height
            this.width = window.outerWidth
            this.height = window.outerHeight
            this.log('fullscreen')
        } else {
            this.stop()
            this.width = this.originalSize.width
            this.height = this.originalSize.height
            this.log('exit fullscreen')
        }
    }
}

window.customElements.define('base-canvas', BaseCanvas, {extends: 'canvas'})
