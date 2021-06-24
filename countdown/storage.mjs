import Timer from './timer.mjs'
import Snackbar from './snackbar.mjs'
// import CryptoStorage from './crypto.mjs'



// export const save = async () => {
//     let timers = Array.from(list.querySelectorAll('progress'))
//     let cypthertext = await CryptoStorage.encrypt(JSON.stringify(timers))
//     localStorage.setItem('savedTimers', cypthertext)
//     new Snackbar('Timers saved', 2000)
// }

// export const load = async() => {
//     let timers = localStorage.getItem('savedTimers')
//     if(timers) {
//         timers = await CryptoStorage.decrypt(timers)
//         timers = JSON.parse(timers)
//         list.clear()
//         timers.forEach(timer => {
//             list.append(new Timer(timer))
//         })
//         new Snackbar('Timers loaded')
//     } else {
//         new Snackbar('No saved timers found')
//     }
// }



class Storage {
    constructor() {
    }
    
    async save(key, value) {
        return localStorage.setItem(key, value)
    }
    
    async load(key) {
        return localStorage.getItem(key)
    }
}

class CryptoStorage extends Storage {
    
    encoder = new TextEncoder()
    decoder = new TextDecoder()
    
    constructor() {
        super()
        this.init()
    }
    
    async init() {
        let salt = await super.load('salt')
        let iv = await super.load('iv')
        
        if(!salt || !iv) {
            console.log('No iv or salt found. Creating them now')
            this.salt = window.crypto.getRandomValues(new Uint8Array(16))
            this.iv = window.crypto.getRandomValues(new Uint8Array(12))
        } else {
            this.salt = new Uint8Array(salt.split(','))
            this.iv = new Uint8Array(iv.split(','))
        }
        localStorage.setItem('salt', this.salt)
        localStorage.setItem('iv', this.iv)
    }
    
    get algorithm() { return {name: "AES-GCM", iv: this.iv}}
    
    async save(key, value) {
        let buffer = await this.encrypt(value)
        value = Array.from(new Uint8Array(buffer))
        return super.save(key, JSON.stringify(value))
    }
    
    async load(key) {
        let value = await super.load(key)
        let buffer = new Uint8Array(JSON.parse(value))
        return await this.decrypt(buffer)
    }
    
    async encrypt(plaintext) {
        let keyMaterial = await this.getKeyMaterial()
        let key = await this.getKey(keyMaterial, this.salt)
        let message = this.encoder.encode(plaintext)
        return window.crypto.subtle.encrypt(this.algorithm, key, message)
    }
    
    async decrypt(ciphertext) {
        let keyMaterial = await this.getKeyMaterial()
        let key = await this.getKey(keyMaterial, this.salt)
        
        try {
            let decrypted = await window.crypto.subtle.decrypt(this.algorithm, key, ciphertext)
            return this.decoder.decode(decrypted)
        } catch (e) {
            throw new Error('Failed to decrypt')
        }
    }
    
    getKeyMaterial() {
        let password = window.prompt("Enter your password")
        password = this.encoder.encode(password)
        return window.crypto.subtle.importKey("raw", password, {name: "PBKDF2"}, false, ["deriveBits", "deriveKey"])
    }
    
    getKey(keyMaterial, salt) {
        return window.crypto.subtle.deriveKey(
            {
                "name": "PBKDF2",
                salt: salt, 
                "iterations": 100000,
                "hash": "SHA-256"
            },
            keyMaterial,
            { "name": "AES-GCM", "length": 256},
            true,
            [ "encrypt", "decrypt" ]
            )
        }
    }
    
    class TimerStorage extends CryptoStorage {
        constructor(key) {
            super()
            this.key = key
        }
        
        get timers() { return Array.from(this.list.querySelectorAll('progress')) }
        get list() { return document.forms['timers'] }
        
        async save() {
            let value = JSON.stringify(this.timers)
            await super.save(this.key, value)
            new Snackbar('Timers saved', 2000)
        }
        
        async load() {
            try {
                let timers = await super.load(this.key)
                timers = JSON.parse(timers)
                this.list.clear()
                timers.forEach(timer => {
                    this.list.append(new Timer(timer))
                })
                new Snackbar('Timers loaded')
            } catch (error) {
                console.log(error)
                new Snackbar(error)
            }
            
        }
    }
    
    const S = new TimerStorage('timers')
    
    S.list.elements['load'].addEventListener('click', () => S.load())
    S.list.elements['save'].addEventListener('click', () => S.save())