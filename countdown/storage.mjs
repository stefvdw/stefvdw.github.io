import Timer from './timer.mjs'
import Snackbar from './snackbar.mjs'
import {encrypt, decrypt} from './crypto.mjs' 
import IDB from './idb.mjs'

class TimerStorage {
    constructor(key) {
        this.key = key
    }
    
    get timers() { return Array.from(this.list.querySelectorAll('progress')) }
    get list() { return document.forms['timers'] }
    
    async save() {
        let value = JSON.stringify(this.timers)
        let blob = await encrypt(value)
        await IDB.set({name: 'default', blob})
        new Snackbar('Timers saved', 2000)
    }
    
    async load() {
        try {
            let {name, blob} = await IDB.get('default')
            let timers = await decrypt(blob)
            timers = JSON.parse(timers)
            this.list.clear()
            timers.forEach(timer => {
                this.list.append(new Timer(timer))
            })
            new Snackbar(`${name} timers loaded`)
        } catch (error) {
            console.log(error)
            new Snackbar(error)
        }
        
    }
}

const S = new TimerStorage('timers')

S.list.elements['load'].addEventListener('click', () => S.load())
S.list.elements['save'].addEventListener('click', () => S.save())