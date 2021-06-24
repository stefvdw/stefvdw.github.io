export default class Snackbar extends HTMLDialogElement {
    constructor(text, timeout=2000) {
        super()
        this.classList.add('snackbar')
        this.innerText = text
        setTimeout(() => this.remove(), timeout)
        document.body.append(this)
    }
    connectedCallback() {
        this.onclick = this.remove
        this.show()
    }
}

customElements.define('snack-bar', Snackbar, {extends: "dialog"})