const DB_NAME = 'scoreboard'
const DB_VERSION = 1
const STORE_NAME = 'games'

let dbPromise = null

export function openDB() {
    if (dbPromise) return dbPromise
    
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onupgradeneeded = setupDatabase
        request.onsuccess = () => {
            request.result.addEventListener('error', console.error)
            resolve(request.result)
        }
        request.onerror = () => reject(request.error)
    })
    
    return dbPromise
}

export async function db(mode = 'readonly') {
    const db = await openDB()
    const transaction =  db.transaction(STORE_NAME, mode)
    return transaction.objectStore(STORE_NAME)
}

function setupDatabase(event) {
    const db = event.target.result
    const store = db.createObjectStore("games", { keyPath: "id", autoIncrement: true })
    store.createIndex("players", "players", { unique: false, multiEntry: true })
    store.createIndex("date", "date", { unique: false })
}