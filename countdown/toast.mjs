export default class Toast extends HTMLDialogElement {
    constructor(text, timeout=2000) {
        super()
        this.classList.add('toast')
        this.innerText = text
        setTimeout(() => this.remove(), timeout)
        document.body.append(this)
    }
    connectedCallback() {
        this.onclick = this.remove
        this.show()
    }
}

customElements.define('toast-bar', Toast, {extends: "dialog"})