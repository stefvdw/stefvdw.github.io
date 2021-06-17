import Bluetooth from '/bluetooth.mjs'

export default class Chart extends HTMLCanvasElement {
    constructor() {
        super()
        this.ctx = this.getContext('2d')
        this.ctx.translate(0, this.height)
        this.ctx.scale(1, -1)
        this.onclick = () => this.plot(9)
    }
    
    plot(i) {
        let data = JSON.parse(localStorage.getItem('data'))

        let raw = i ? data.map(d => d ? d.raw[i] : 0) : data.map(d => d ? d.temperature : 0)
       
        
        this.ctx.clearRect(0,0,this.width, this.height)
        raw.forEach((y, x) => {
            this.ctx.fillStyle = 'red'
            this.ctx.fillRect(x,0,1,y)
            console.log(x,y)
            // this.ctx.lineTo(x,y)
        })
    }
}

customElements.define('temp-chart', Chart, {extends: 'canvas'})