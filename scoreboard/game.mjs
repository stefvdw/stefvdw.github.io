import { db } from "./idb.mjs"

export default class Game {
    constructor(data) {
        Object.assign(this, data)
        
        this.name ??= ""
        this.players ??= []
        this.rounds ??= []
        this.date ??= Date.now()
    }
    
    addPlayer(name) {
        if (this.players.includes(name)) return
        this.players.push(name)
    }
    
    addScores(scoresArray) {
        if (scoresArray.length !== this.players.length) {
            throw new Error("Scores must match number of players")
        }
        
        this.rounds.push(scoresArray.map(n => Number(n) || 0))
    }
    
    getTotals() {
        const totals = new Array(this.players.length).fill(0)
        
        for (const round of this.rounds) {
            round.forEach((score, i) => {
                totals[i] += score
            })
        }
        
        return totals
    }
    
    async save() {
        const store = await db('readwrite')
        let request = store.put(this)
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                this.id = this.id || request.result
                resolve(this)
            }
            request.onerror = () => reject(request.error)
        })
    }
    
    static async getAll() {
        const store = await db()
        
        return new Promise((resolve, reject) => {
            const req = store.getAll()
            req.onsuccess = () => resolve(req.result.map(g => new Game(g)))
            req.onerror = () => reject(req.error)
        })
    }
    
    static async getById(id) {
        const store = await db()
        
        id = Number(id)
        return new Promise((resolve, reject) => {
            const req = store.get(id)
            req.onsuccess = () => resolve(req.result ? new Game(req.result) : null)
            req.onerror = () => reject(req.error)
        })
    }
    
    static async findByPlayer(name) {
        const store = await db()
        const index = store.index("players")
        
        return new Promise((resolve, reject) => {
            const req = index.getAll(IDBKeyRange.only(name))
            req.onsuccess = () => resolve(req.result.map(g => new Game(g)))
            req.onerror = () => reject(req.error)
        })
    }
}