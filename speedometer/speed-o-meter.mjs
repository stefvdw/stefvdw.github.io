import BaseCanvas from '/canvas.mjs'

export default class SpeedOMeter extends BaseCanvas {

    speed = 0
    max = 300
    trackerId = undefined
    color = "teal"

    constructor() {
        super()
        this.fullscreen = false
        this.wakelock = true
    }

    connectedCallback() {
        super.connectedCallback()
        this.clear()
        this.drawText('click to start')
        this.arc()
    }

    async start() {
        await super.start()
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
        this.trackerId = navigator.geolocation.watchPosition(this.update.bind(this), alert, options)
        this.color = getComputedStyle(document.documentElement).getPropertyValue("--brand") || this.color
    
        this.log(`tracking started: ${this.trackerId}`)
    }

    async stop() {
        await super.stop()
        if(!this.trackerId) return
        navigator.geolocation.clearWatch(this.trackerId)
        this.trackerId = undefined
        this.clear()
        this.drawText('⏸︎')
        this.arc()
        this.log('tracking stopped')
    }

    update(position) {
        this.speed = (position.coords.speed * 3.6).toFixed(1) // convert m/s to km/h
        this.draw()
    }

    draw() {
        const speed = this.speed || 0 // set to default
        this.clear()
        this.arc()
        this.drawText(speed)
        this.arc(speed/this.max, this.color, 10)
    }

    drawText(text) {
        this.ctx.fillStyle = this.color
        this.ctx.font = "3rem Roboto"
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText(text, this.width / 2, this.height / 2)
    }

    arc(percent = 1, color = 'lightgrey', width = 15) {
        this.ctx.beginPath()
        this.ctx.strokeStyle = color
        this.ctx.lineCap = "round"
        this.ctx.lineWidth = width

        const start = (0.75) * Math.PI
        const end = percent * (3/2 * Math.PI) // percentage of 3/4 circle

        this.ctx.arc(this.width / 2, this.height / 2, Math.min(this.height, this.width) * 0.4, start, start + end)
        this.ctx.stroke()
    }
}

window.customElements.define('speed-o-meter', SpeedOMeter, {extends: 'canvas'})
