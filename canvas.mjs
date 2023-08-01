export default class BaseCanvas extends HTMLCanvasElement {

    frame = null
    originalSize = {}
    WakeLockSentinel = null

    constructor() {
        super()
        this.ctx = this.getContext("2d")
    }

    get wakelock() { return this.hasAttribute('wakelock')}
    set wakelock(value) { return this.setAttribute('wakelock', !!value)}

    get fullscreen() { return this.hasAttribute('fullscreen')}
    set fullscreen(value) { return this.setAttribute('fullscreen', !!value)}

    connectedCallback() {
        this.addEventListener('fullscreenchange', this.handleFullscreen.bind(this))
        this.onclick = this.start.bind(this)
    }

    async start() {
        this.onclick = undefined
        if(this.wakelock) {
            this.WakeLockSentinel = await navigator.wakeLock.request("screen")
            this.log('wakelock enabled')
        }
        if(this.fullscreen) {
            await this.requestFullscreen()
        } else {
            this.onclick = this.stop.bind(this)
        }
    }

    async stop() {
        this.onclick = this.start.bind(this)
        if(this.wakelock && this.WakeLockSentinel && !this.WakeLockSentinel.released) {
            await this.WakeLockSentinel.release()
            this.WakeLockSentinel = null
            this.log('wakelock released')
        }
        if(this == document.fullscreenElement) {
            await document.exitFullscreen()
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
