export default class SpeedOMeter extends HTMLCanvasElement {

    speed = 0
    max = 300
    trackerId

    constructor() {
        super()
    }

    connectedCallback() {
        this.addEventListener('click', this.toggleTracking.bind(this))
        this.draw()
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
        console.log('tracking stopped')
    }

    update(position) {
        this.speed = position.coords.speed
        this.draw()
    }

    draw() {
        const speed = this.speed || 0 // set to default
        const ctx = this.getContext("2d")
        ctx.clearRect(0, 0, this.width, this.height)
        ctx.font = "50px Roboto"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(speed.toFixed(2), this.width / 2, this.height / 2, 100)
        ctx.beginPath()
        ctx.lineCap = "round"
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 15
        ctx.arc(this.width / 2, this.height / 2, 100, (0.75) * Math.PI, (0.25) * Math.PI)
        ctx.stroke()

        ctx.beginPath()
        ctx.strokeStyle = "teal"
        ctx.lineWidth = 10

        console.log(0.75 + (speed / 200), speed/200)
        ctx.arc(this.width / 2, this.height / 2, 100, (0.75) * Math.PI, ((speed / 200) + 0.75) * Math.PI)
        ctx.stroke()
    }


}

window.customElements.define('speed-o-meter', SpeedOMeter, {extends: 'canvas'})
