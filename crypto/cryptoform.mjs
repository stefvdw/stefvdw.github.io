import CDB from './cdb.mjs'


export default class CryptoForm extends HTMLFormElement {
    constructor() {
        super()
        this.autocomplete = 'off'

    }

    connectedCallback() {
        window.addEventListener('hashchange', this.loadFromHash.bind(this))
        this.addEventListener('submit', this.store.bind(this))
        this.loadFromHash()
    }

    async loadFromHash() {
        this.key = decodeURI(window.location.hash).slice(1)
        if(!this.key) return
        console.log('loading key:', this.key)
        const message = await CDB.get(this.key)
        console.log('got message:', message)
        this.elements.name.value = this.key
        this.elements.message.value = message
    }

    async store(event) {
        event.preventDefault()

        if(event.submitter.value == 'delete') {
            this.reset()
            return CDB.delete(this.key)
        } else {
            const name = this.elements.name.value
            const message = this.elements.message.value
            const password = this.elements.password.value
            
            if(name !== this.key) {
                await CDB.delete(this.key)
                this.key = name
            }
    
            return CDB.set(name, message, password)
        }
          
       
    }
}

customElements.define('crypto-form', CryptoForm, {extends: 'form'})