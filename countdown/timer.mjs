export default class Timer extends HTMLProgressElement {
            
    constructor(options = {}) {
        super()
        let d = this.value ? new Date(this.value) : undefined
        this.hours = parseInt(d?.getUTCHours()) || options.hours || 0
        this.minutes = d?.getUTCMinutes() || options.minutes || 0
        this.seconds = d?.getUTCSeconds() || options.seconds || 0
        this.name = this.getAttribute('name') || options.name 
        this.setAttribute('name', this.name)
        this.title = this.name
    }
               
    get duration() { return ((this.hours * 60 + this.minutes) * 60 + this.seconds) * 1000 }
    
    get readableClock() {
        let d = new Date(this.remaining)
        if(this.remaining < 0 ) { return '00:00' }
        let hours = d.getUTCHours().toString().padStart(2, '00')
        let minutes = d.getUTCMinutes().toString().padStart(2, '00')
        let seconds = d.getUTCSeconds().toString().padStart(2, '00')
        return `${hours > 0 ? hours + ':' : ''}${minutes}:${seconds}`
    }
    
    connectedCallback() {
        this.ondblclick = this.clone.bind(this)
        this.remaining = this.duration
        this.max = this.duration
        this.updateUI()
    }
    
    updateUI() {
        this.value = this.remaining
        this.setAttribute('remaining', this.readableClock)
    }

    clone() {
        this.after(new Timer(this))
    }
    
    stop() {
        if(!this.frame) return
        cancelAnimationFrame(this.frame)
        this.frame = null
        // this.onclick = this.start.bind(this)
    }

    reset() {
        this.remaining = this.duration
        this.updateUI()
        this.removeAttribute('done')
    }
    
    start() {
        // this.onclick = this.stop.bind(this)
        this.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
        this.last = performance.now()
        this.frame = requestAnimationFrame(this.update.bind(this))
    }

    finish() {
        this.stop()
        this.setAttribute('done', '')
        this.dispatchEvent(new Event('done', {bubbles: true}))
    }
    
    update(milis) {
        let timeSinceLastRequest = milis - this.last
        this.remaining = this.remaining - timeSinceLastRequest
        this.last = milis
        this.updateUI()
        if(this.remaining < 0) {
            this.finish()
        } else {
            this.frame = requestAnimationFrame(this.update.bind(this))
        }
    }
}

customElements.define('countdown-timer', Timer, {extends: "progress"})