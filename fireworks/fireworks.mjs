import BaseCanvas from '/canvas.mjs'

export default class Fireworks extends BaseCanvas {

    constructor() {
        super()
        this.fullscreen = true
        this.wakelock = true

        this.size = 10
        this.pixels = new Array()
        this.renderInterval = null
        this.autoInterval = null
    }

    get scaleX() {return this.canvas.width / this.gridsize.width}
    get scaleY() {return this.canvas.height / this.gridsize.height}

    set auto(value) {
        value = parseInt(value)
        this.autospeed = isNaN(value) ? undefined : value
    }

    connectedCallback() {
        super.connectedCallback()
        this.clear()
        this.drawText('click to start')
        this.arc()
    }

    async start() {
        await super.start()
        this.addEventListener('pointerdown', this.handleInput.bind(this), false)
        this.renderInterval = setInterval(this.draw.bind(this), 10)
        this.log(`Game started`)
    }

    async stop() {
        await super.stop()
        this.addEventListener('pointerdown', this.handleInput.bind(this), false)
        clearInterval(this.renderInterval)
        clearInterval(this.autoInterval)
        this.log('Game stopped')
    }

    draw() {
        this.pixels.forEach(this.clearPixels.bind(this))
        this.pixels.forEach(this.movePixels.bind(this))
        this.ctx.fillStyle = "rgba(0,0,0,0.1)"
        this.clear()
        
        for (const pixel of this.pixels.flat()) {
            this.ctx.fillStyle = pixel.color
            this.ctx.fillRect(pixel.x, pixel.y, 10 ,10)
        }
    }

    addPixel(x,y) {
        if(!x && !y) {
            x = Math.random() * this.width
            y = Math.random() * this.height
        }
        x = Math.round(x/this.size) * this.size
        y = Math.round(y/this.size) * this.size
        const color = this.getRandomColor()
        const pixel = {color, x, y}
        this.pixels.push([{...pixel},{...pixel},{...pixel},{...pixel}])
    }

    getRandomColor() {
        const hue = Math.floor((performance.now() /10) % 360)
        return `hsl(${hue}, 100%, 50%)`
    }

    movePixels(pixel) {
        const speed = 3
        pixel[0].x -= speed
        pixel[1].y -= speed
        pixel[2].x += speed
        pixel[3].y += speed
        return pixel
    }

    clearPixels(fireworkevent, index) {
        if(fireworkevent.every(this.isPixelOut.bind(this))) {
            this.pixels.splice(index,1)
        }
    }

    isPixelOut(pixel) {
        return pixel.x < 0 || pixel.y < 0 || pixel.x > this.width || pixel.y > this.height
    }

    handleInput(event) {
        const events = event.type === 'pointermove' && typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [event]
        for (const event of events) {
            if(!event.clientX) return
            this.addPixel(event.clientX, event.clientY)
        }
        this.draw()
    }
}

window.customElements.define('fire-works', Fireworks, {extends: 'canvas'})
