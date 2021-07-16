import CDB from './cdb.mjs'
import Toast from './toast.mjs'


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
        this.key = decodeURI(window.location.hash).slice(1).toLocaleLowerCase()
        if(!this.key) return
        try {
            const message = await CDB.get(this.key)
            this.elements.menu.checked = false
            this.elements.name.value = this.key
            this.elements.message.value = message
        } catch (error) {
            new Toast(error)
        }
        
    }

    async store(event) {
        event.preventDefault()

        if(event.submitter.value == 'delete') {
            this.reset()
            try {
                await CDB.delete(this.key)
                new Toast(`Note '${this.key}' deleted`)
            } catch (error) {
                new Toast(error)
            }
        } else {
            const name = this.elements.name.value.toLocaleLowerCase()
            const message = this.elements.message.value
            const password = this.elements.password.value
            try {
                if(name !== this.key) {
                    await CDB.delete(this.key)
                    this.key = name
                }
                
                await CDB.set(name, message, password)
                new Toast(`Note '${this.key}' saved`)
            } catch (error) {
                new Toast(error)
            } 
        }
          
       
    }
}

customElements.define('crypto-form', CryptoForm, {extends: 'form'})