import Timer from './timer.mjs'
import Toast from './toast.mjs'
import {encrypt, decrypt} from './crypto.mjs' 
import IDB from './idb.mjs'


export default class Storage extends HTMLFormElement {
    
    constructor() {
        super()
    }

    get timersList() { return document.forms['timers']}

    async connectedCallback() {
        this.addEventListener('submit', this.handleSubmit.bind(this))
        this.addEventListener('reset', this.reset.bind(this))
        // this.list.addEventListener('change', this.load.bind(this))
        const timers = await IDB.getAll()
        timers.forEach(timer => {
            const option = new Option(timer.encrypted ? `${timer.name} (protected)` : `${timer.name}`, timer.name)
            if(timer.encrypted) {
                option.setAttribute('encrypted', '')
            }
            this.list.append(option)
        })
    }    

    handleSubmit(event) {
        event.preventDefault()
        switch(event.submitter.value) {
            case 'delete':
                this.delete()
                break
            case 'save':
                this.save()
                this.closest('dialog').close()
                break
            case 'load':
                this.load()
                this.closest('dialog').close()
                break
        }
    }

    reset() {
        super.reset()
        this.password = null
        this.timersList.clear()
    }
    
    async save() {
        let timers = [...this.timersList.children].map(timer => Object.assign({}, timer))
        const name = (this.list.value || window.prompt('Save as')).toLocaleLowerCase()
        const encrypted = this.encrypt.checked
        if(encrypted) {
            timers = await encrypt(JSON.stringify(timers), this.password)
        }
        await IDB.set({name, encrypted, timers})
        new Toast(`Timers saved as ${name}`, 2000)
    }
    
    async load() {
        this.password = null
        try {
            const key = this.list.value.toLocaleLowerCase()
            if(!key) throw new Error('No list name selected')
            let {name, encrypted, timers} = await IDB.get(key)
            // const link = window.URL.createObjectURL(blob)
            // document.getElementById('download').href = link
            if(encrypted) {
                this.password = window.prompt("Enter your password")
                timers = await decrypt(timers, this.password)
                timers = JSON.parse(timers)
            }
            this.encrypt.checked = encrypted
            this.timersList.clear()
            timers.forEach(timer => {
                this.timersList.append(new Timer(timer))
            })
            new Toast(`${name} timers loaded`)
        } catch (error) {
            console.log(error)
            this.reset()
            new Toast(error)
        }
        // this.closest('dialog').close()
    }
}

customElements.define('storage-form', Storage, {extends: "form"})

// class TimerStorage {
//     constructor(key) {
//         this.key = key
//     }
    
//     get timers() { return Array.from(this.list.querySelectorAll('progress')) }
//     get list() { return document.forms['timers'] }
    
    
// }

// const S = new TimerStorage('timers')

// S.list.elements['load'].addEventListener('click', () => S.load())
// S.list.elements['save'].addEventListener('click', () => S.save())