import Timer from './timer.mjs'
import Snackbar from './snackbar.mjs'

export default class Edit extends HTMLDialogElement {

    static get observedAttributes() { return ['open'] }
    
    constructor() {
        super()
        this.timer = null
    }

    get form() { return this.querySelector('form') }
    get timers() { return document.forms['timers'].children}

    connectedCallback() {
        window.addEventListener('contextmenu', this.open.bind(this))
        this.form.addEventListener('submit', this.handleSubmit.bind(this))
        this.addEventListener('close', this.reset.bind(this))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.form.elements['delete'].hidden = !this.timer
        this.form.elements['clone'].hidden = !this.timer
        this.form.elements['position'].max = this.timers.length + 1
        this.form.elements['position'].value = this.timers.length + 1
      }
      

    open(event) {
        if(event.target instanceof Timer) {
            event.preventDefault()
            this.timer = event.target
            this.showModal()
            this.form.elements['name'].value = this.timer.name || ''
            this.form.elements['hours'].value = this.timer.hours
            this.form.elements['minutes'].value = this.timer.minutes
            this.form.elements['seconds'].value = this.timer.seconds
            this.form.elements['position'].value = [...this.timers].indexOf(this.timer) + 1
        }
        
    }

    handleSubmit(event) {
        event.preventDefault()
        switch(event.submitter.value) {
            case 'save':
                this.save()
                break
            case 'delete':
                this.delete()
                break
            case 'clone':
                this.timer.clone()
                new Snackbar(`Timer '${this.timer.name}' duplicated`)
                break
        }
        this.close()
    }
    
    save() {
        const name = this.form.elements['name'].value || ''
        const hours = this.form.elements['hours'].valueAsNumber || 0
        const minutes = this.form.elements['minutes'].valueAsNumber || 0
        const seconds = this.form.elements['seconds'].valueAsNumber || 0
        const timer = new Timer({name, seconds, minutes, hours})

        const position = this.form.elements['position'].valueAsNumber

        if(this.timer) {
            this.timer.replaceWith(timer)
        } else {
            if(!isNaN(position) && this.timers[position - 1]) {
                this.timers[position - 1].before(timer)
            } else {
                document.forms['timers'].append(timer)
            }
        }
        new Snackbar(`Timer '${timer.name}' saved`)
        
    }
    
    delete() {
        this.timer?.remove()
        new Snackbar(`Timer '${this.timer.name}' removed`)
    }

    reset() {
        this.timer = null
        this.form.reset()
    }
}

customElements.define('edit-dialog', Edit, {extends: "dialog"})