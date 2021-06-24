import Timer from './timer.mjs'
import Snackbar from './snackbar.mjs'

export default class Edit extends HTMLDialogElement {

    static get observedAttributes() { return ['open'] }
    
    constructor() {
        super()
        this.timer = null
    }

    get form() { return this.querySelector('form') }

    connectedCallback() {
        window.addEventListener('contextmenu', this.open.bind(this))
        this.form.addEventListener('submit', this.handleSubmit.bind(this))
        this.addEventListener('close', this.reset.bind(this))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.form.elements['delete'].hidden = !this.timer
        this.form.elements['clone'].hidden = !this.timer
      }
      

    open(event) {
        if(event.target instanceof Timer) {
            event.preventDefault()
            this.timer = event.target
            this.form.elements['name'].value = this.timer.name || ''
            this.form.elements['hours'].value = this.timer.hours
            this.form.elements['minutes'].value = this.timer.minutes
            this.form.elements['seconds'].value = this.timer.seconds
            this.showModal()
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

        if(this.timer) {
            this.timer.replaceWith(timer)
        } else {
            document.forms['timers'].append(timer)
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