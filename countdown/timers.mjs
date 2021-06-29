import Toast from './toast.mjs'

export default class Timers extends HTMLFormElement {

    index = 0
    active = false
    
    constructor() {
        super()
    }

    get timers() { return this.querySelectorAll('progress') }
    get currentTimer() { return this.timers[this.index] }
    
    connectedCallback() {
        this.addEventListener('click', event => event.stopImmediatePropagation())
        this.addEventListener('done', this.selectNextTimer.bind(this))
        this.addEventListener('submit', this.handleSubmit.bind(this))
        this.addEventListener('reset', this.resetTimers.bind(this))
    }

    handleSubmit(event) {
        event.preventDefault()
        if(event.submitter.value == 'startstop') {
            if(this.active) {
                this.stopCurrentTimer()
            } else {
                this.startCurrentTimer()
            }
        }

        if(event.submitter.value == 'clear') {
            this.clear()
            this.stopCurrentTimer()
        }
    }

    resetTimers() {
        this.timers.forEach(timer => timer.reset())
        let active = this.active
        this.stopCurrentTimer()
        this.index = 0
        if(active) {
            this.startCurrentTimer()
        }
    }

    startCurrentTimer() {
        if(!this.currentTimer) return
        this.currentTimer.start()
        this.active = true
        this.startstop.innerText = 'stop'
    }

    stopCurrentTimer() {
        this.currentTimer?.stop()
        this.active = false
        this.startstop.innerText = 'start'
    }
    
    selectNextTimer(event) {
        this.index++
        if(this.currentTimer) {
            this.currentTimer.start()
        } else {
            this.finished()
        }
    }

    finished() {
        this.stopCurrentTimer()
        this.resetTimers()
        new Toast('Finished')
    }

    clear() {
        this.textContent = ''
        new Toast('Cleared timers')
    }
}

customElements.define('countdown-list', Timers, {extends: "form"})