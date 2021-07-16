class IDB {
       
    constructor(version, storeName, databaseName) {
        this.databaseName = databaseName || 'countdown'
        this.storeName = storeName || 'timers'
        this.version = version || 1
        this.DBOpenRequest = indexedDB.open(this.databaseName, this.version)
        this.DBOpenRequest.onupgradeneeded = this.upgrade.bind(this) 
    }
    
    database() {
        return new Promise((resolve, reject) => {
            if (this.DBOpenRequest.readyState === 'done') {
                resolve(this.DBOpenRequest.result)
            }
            this.DBOpenRequest.addEventListener('success', () => {
                resolve(this.DBOpenRequest.result)
            })
            this.DBOpenRequest.onerror = reject
        })
    }
    
    upgrade(event) {
        const db = event.target.result
        console.group('database')
        console.log(`update database to version ${this.version}`)
        switch (db.version) {
            case 0:
            console.log('No database found.')
            case 1:
            console.log('Creating the countdown database')
            let store
            if (!db.objectStoreNames.contains(this.storeName)) {
                store = db.createObjectStore(this.storeName, { keyPath: 'name' })
            } else {
                store = db.objectStore(this.storeName)
            }
            console.log(`${this.storeName} store created`)
            
            // case 2:
        }
        
        console.groupEnd()
    }
    
    transaction(mode = 'readonly') {
        return new Promise((resolve, reject) => {
            this.database().then(db => {
                if(db.objectStoreNames.contains(this.storeName)) {
                    const transaction =  db.transaction(this.storeName, mode)
                    transaction.oncomplete = resolve
                    resolve(transaction.objectStore(this.storeName))
                } else {
                    reject(`${this.storeName} not found`)
                }
            })
        })
    }
    
    get(key, transaction) {
        return new Promise(async (resolve, reject) => {
            transaction = transaction || await this.transaction()
            const request = transaction.get(key.toLocaleLowerCase())
            request.onsuccess = () => resolve(request.result)
            transaction.onerror = reject
        })
    }
    
    getAll(index, query) {
        return new Promise((resolve, reject) => {
            this.transaction().then(transaction => {
                if(index && transaction.indexNames.contains(index)) {
                    transaction = transaction.index(index)
                }
                let request
                if(query instanceof IDBKeyRange) {
                    request = transaction.getAll(query)
                } else {
                    request = transaction.getAll()
                }
                request.onsuccess = () => resolve(request.result)
                transaction.onerror = reject
            }).catch(reject)
        })
    }

    getAllKeys(query, count) {
        return new Promise((resolve, reject) => {
            this.transaction().then(transaction => {
                let request
                if(query instanceof IDBKeyRange) {
                    request = transaction.getAllKeys(query, count)
                } else {
                    request = transaction.getAllKeys()
                }
                request.onsuccess = () => resolve(request.result)
                transaction.onerror = reject
            }).catch(reject)
        })
    }
    
    set(data, transaction) {
        return new Promise(async (resolve, reject) => {
            transaction = transaction || await this.transaction('readwrite')
            const request = transaction.put(data)
            request.onsuccess = () => resolve(request.result)
            transaction.onerror = reject
        })
    }
    
    delete(key) {
        return new Promise((resolve, reject) => {
            this.transaction('readwrite').then(transaction => {
                const request = transaction.delete(key.toLocaleLowerCase())
                request.onsuccess = () => resolve(request.result)
                transaction.onerror = reject
            }).catch(reject)
        })
    }
    
    has(key) {
        return new Promise((resolve, reject) => {
            this.transaction().then(transaction => {
                const request = transaction.getKey(key.toLocaleLowerCase())
                request.onsuccess = () => resolve(request.result)
                transaction.onerror = reject
            }).catch(reject)
        })
    }
}

class CDB extends IDB {
    
    constructor() {
        super(1, 'notes', 'cryptodb')
        this.encoder = new TextEncoder()
        this.decoder = new TextDecoder()
    }
    

    getKeyMaterial(password) {
        password = password || window.prompt("Enter your password")
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
    
    async get(key, password, transaction) {
        const result = await super.get(key, transaction)
        if(!result) throw `'${key}' not found`
        const {name, blob} = result
        const cryptoArray = await blob.arrayBuffer()
        const salt = cryptoArray.slice(0,16)
        const iv = cryptoArray.slice(16,28)
        const ciphertext = cryptoArray.slice(28)
        const keyMaterial = await this.getKeyMaterial(password)
        const cryptokey = await this.getKey(keyMaterial, salt)
        
        try {
            const decrypted = await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, cryptokey, ciphertext)
            return this.decoder.decode(decrypted)
        } catch (e) {
            throw `Incorrect password for ${key}`
        }
    }
        
    async set(key, message, password, transaction) {
        const keyMaterial = await this.getKeyMaterial(password)
        const salt = window.crypto.getRandomValues(new Uint8Array(16))
        const cryptokey = await this.getKey(keyMaterial, salt)
        const iv = window.crypto.getRandomValues(new Uint8Array(12))
        message = this.encoder.encode(message)
        const ciphertext = await window.crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, cryptokey, message)
        const cryptoBlob = new Blob([salt, iv, ciphertext], {type: 'application/octet-stream'})
        return super.set({name: key, blob: cryptoBlob}, transaction)
    }
}

export default new CDB()