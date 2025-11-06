export default class Logger extends HTMLDListElement {
    constructor(){
        super()
        this.id = 'logger'
    }

    connectedCallback() {
        this.log('hello')
    }

    log(message) {
        const item = document.createElement('dd')
        item.textContent = message
        this.append(item)
    }
}

customElements.define('onscreen-logger', Logger, { extends: 'dl' })