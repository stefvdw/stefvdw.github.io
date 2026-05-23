import Game from "./game.mjs"

export default class GameForm extends HTMLFormElement {
    
    constructor() {
        super()
        this.game = null
        this.currentScores = []
    }
    
    connectedCallback() {
        this.onsubmit = this.handleSubmit.bind(this)
        this.gameId.addEventListener("change", this.render.bind(this))
        
        this.windowWith = window.matchMedia("(max-width: 740px)")
        this.windowWith.addEventListener("change", this.renderGames.bind(this))
        
        this.renderGames()
    }
    
    async handleSubmit(event) {
        event.preventDefault()
        
        const action = event.submitter.name
        
        // ➕ Add player (only before game starts)
        if (action === "addPlayer") {
            if (this.gameSetup.disabled) return
            
            const name = this.newPlayer.value.trim()
            if (!name) return
            
            this.game.addPlayer(name)
            this.newPlayer.value = ""
            
            this.renderGame()
        }
        
        // ▶️ Start game / ➕ Add round
        if (action === "saveRound") {
            
            // ngame has not started. Save without score
            const scores = this.getCurrentScores()
            
            // 🆕 First time → persist game
            if (!this.game.id) {
                // fallback name
                this.game.name ||= `Game ${new Date().toLocaleString()}`
                
                await this.game.save()
                
                if(!this.gameId.namedItem(this.game.id)) {
                    const option = new Option(this.game.name, this.game.id)
                    option.id = this.game.id
                    this.gameId.add(option)
                }
                
                this.gameId.value = this.game.id
                this.gameSetup.disabled = true
            } else {
                // ➕ Add round
                this.game.addScores(scores)
                await this.game.save()
                
                this.currentScores = []
            }
            
            
            this.renderGame()
        }
    }
    
    async renderGames() {
        const games = await Game.getAll()
        
        const currentValue = this.gameId.value
        
        this.gameId.innerHTML = ""
        this.gameId.add(new Option("New game", "new"))
        
        for (const game of games) {
            this.gameId.add(new Option(game.name, game.id))
        }
        
        this.gameId.value = currentValue || "new"
        
        this.gameId.size = this.windowWith.matches ? 1: 20
        
        this.render()
    }
    
    async render() {
        const gameId = this.gameId.value
        
        if (gameId === "new") {
            this.game = new Game()
            this.gameSetup.disabled = false
        } else if (gameId) {
            this.game = await Game.getById(gameId)
            this.gameSetup.disabled = true
        } else {
            return
        }
        
        this.currentScores = []
        
        this.renderGame()
    }
    
    renderGame() {
        if (!this.game) return
        
        this.renderHeader()
        this.renderTable()
        this.renderActions()
    }
    
    renderHeader() {
        this.gameName.value = this.game.name || ""
        this.gameName.oninput = (e) => {
            this.game.name = e.target.value
        }
    }
    
    renderActions() {
        const button = this.querySelector('button[name="saveRound"]')
        button.textContent = this.game.id ? "Save Round" : "Start Game"
        button.disabled = !this.game.players.length
    }
    
    renderTable() {
        document.getElementById('scoreboard').replaceWith(new ScoreBoard(this.game))
    } 
    
    getCurrentScores() {
        const inputs = Array.from(this.querySelectorAll('score-board input[type="number"]'))
        return inputs.map(input => input.valueAsNumber)
    }
}

class ScoreBoard extends HTMLElement {
    constructor(game) {
        super()
        
        this.game = game
        this.players = game?.players || []
        this.rounds = game?.rounds || []
        
        this.roundCounter = 1
        this.id = 'scoreboard'
        
        this.render()
    }
    
    connectedCallback() {
        this.lastElementChild?.scrollIntoView({block: "end", inline: "nearest"})
    }
    
    render() {
        this.innerHTML = ""
        
        if (!this.players?.length) return
        
        this.style.gridTemplateColumns = `auto repeat(${this.players.length}, 1fr)`
        
        this.renderHeader()
        this.renderRounds()
        this.renderInput()
        this.renderTotals()
    }
    
    // 🔹 helper
    cell(content, className = "") {
        const el = document.createElement("div")
        el.textContent = content
        if (className) el.className = className
        this.appendChild(el)
        return el
    }
    
    renderHeader() {
        this.cell("Players", "header")
        
        for (const player of this.players) {
            this.cell(player, "header")
        }
    }
    
    renderRounds() {
        if (!this.rounds?.length || !this.game.id) return
        
        for (const round of this.rounds) {
            this.cell(`Round ${this.roundCounter++}`, "label")
            
            for (const score of round) {
                this.cell(score, "score")
            }
        }
    }
    
    renderInput() {
        if (!this.game.id) return
        
        this.cell(`Round ${this.roundCounter++}`, "label")
        
        for (let i = 0; i < this.players.length; i++) {
            const input = document.createElement("input")
            input.type = "number"
            input.value = 0            
            this.appendChild(input)
        }
    }
    
    renderTotals() {
        if (!this.rounds?.length) return
        
        const totals = this.game.getTotals()
        
        const lastRow = this.cell("Total", "label")
        
        for (const total of totals) {
            this.cell(total, "total")
        }
    }
}

customElements.define("game-form", GameForm, { extends: "form" })
customElements.define("score-board", ScoreBoard)