class IDB {
    
    databaseName = 'countdown'
    storeName = 'timers'
    version = 1
    
    constructor() {
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
            // store.createIndex("category", "category", { unique: false })
            // store.createIndex("count", "count", { unique: false })
            // store.createIndex("date", "date", { unique: false })
            // store.createIndex("subitems", "subitems", { unique: false })
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

export default new IDB()