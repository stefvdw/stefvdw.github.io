export default class SpeedOMeter extends HTMLCanvasElement {

    speed = 0
    max = 300
    trackerId

    constructor() {
        super()
        this.ctx = this.getContext("2d")
        this.ctx.font = "50px Roboto"
        this.ctx.textAlign = "center"
        this.ctx.fillStyle = "currentcolor" //getComputedStyle(html).getPropertyValue("--brand");
        this.ctx.textBaseline = "middle"
        this.ctx.lineCap = "round"
    }

    connectedCallback() {
        this.addEventListener('click', this.toggleTracking.bind(this))
        this.clear()
        this.drawText('click to start')
        this.arc()
    }

    toggleTracking(event) {
        this.trackerId ? this.stop() : this.start()
    }

    start() {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
        this.trackerId = navigator.geolocation.watchPosition(this.update.bind(this), alert, options)
        console.log('tracking started', this.trackerId)
    }

    stop() {
        if(!this.trackerId) return
        navigator.geolocation.clearWatch(this.trackerId)
        this.trackerId = undefined
        this.clear()
        this.drawText('⏸︎')
        this.arc()
        console.log('tracking stopped')
    }

    update(position) {
        this.speed = position.coords.speed
        this.draw()
    }

    draw() {
        const speed = this.speed || 0 // set to default
        this.clear()
        this.arc()
        this.drawText(speed.toFixed(2))
        this.arc(speed/this.max, 'teal', 10)

        console.log(0.75 + (speed / 200), speed/200)
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height)
    }

    drawText(text) {
        this.ctx.fillText(text, this.width / 2, this.height / 2, 100)
    }

    arc(percent = 1, color = 'lightgrey', width = 15) {
        this.ctx.beginPath()
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = width

        const start = (0.75) * Math.PI
        const end = percent * (3/2 * Math.PI) // percentage of 3/4 circle

        this.ctx.arc(this.width / 2, this.height / 2, 100, start, start + end)
        this.ctx.stroke()
    }
}

window.customElements.define('speed-o-meter', SpeedOMeter, {extends: 'canvas'})
