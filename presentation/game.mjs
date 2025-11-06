export default class Game extends HTMLCanvasElement{
    constructor() {
        super()
        if (!navigator.presentation.receiver) throw new Error('Not a receiver')
        this.players = []
        this.balls = []
        this.init()
        this.width = 1000
        this.height = 1000
        this.ctx = this.getContext('2d')
    }

    get stats() {
        let stats = Object.groupBy(this.connections, (connection) => connection.state)
        stats = Object.entries(stats).map(([status, connections]) => `${status}:${connections.length}`).join('|')
        console.log(stats)
        return stats
    }
    
    async init() {
        this.list = await navigator.presentation.receiver.connectionList
        this.list.connections.map(this.addPlayer.bind(this))
        this.list.addEventListener('connectionavailable', (event) => this.addPlayer(event.connection))
        
        requestAnimationFrame(this.render.bind(this))

        setInterval(this.addBall.bind(this), 2000)
    }

    addPlayer(connection) {
        console.log(connection.id)
        const player = new Player(connection)
        this.players.push(player)
    }

    addBall() {
        const lastball = this.balls.at(-1)
        this.balls.push(new Ball(lastball))
    }

    render() {
        this.clearCanvas()
        
        this.ballsPath = new Path2D()
        this.ctx.fillStyle = 'red'
        this.balls.forEach(this.drawBall.bind(this))
        this.ctx.fill(this.ballsPath)

        this.players.forEach(this.checkCollision.bind(this))

        this.players.forEach(this.drawPlayer.bind(this))


        requestAnimationFrame(this.render.bind(this))
    }

    drawBall(ball) {
        ball.update(this.width, this.height)
        this.ballsPath.moveTo(ball.x, ball.y)
        this.ballsPath.arc(ball.x, ball.y, 5, 0, 2 * Math.PI, false)
    }

    drawPlayer(player) {
        this.clampToCanvas(player)
        this.ctx.beginPath()
        this.ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI, false)
        this.ctx.fillStyle = player.color || 'green'
        this.ctx.fill()
    }

    checkCollision(player) {
        const isHit = this.ctx.isPointInPath(this.ballsPath, player.x, player.y)
        if(isHit) {
            player.color = 'purple'
            player.speed = 0
        }
    }

    clampToCanvas(object) {
        object.x = Math.min(Math.max(object.x, 0), this.width);
        object.y = Math.min(Math.max(object.y, 0), this.height);
    }

    clearCanvas() {
        this.ctx.clearRect(0,0,this.width, this.height)
    }
}

class Player {
    x = 50
    y = 50
    speed = 5

    constructor(connection) {
        this.connection = connection
        this.connection.addEventListener('message', this.update.bind(this))
    }

    update(event) {
        const data = event.data //Always a string
        if(data.includes('Up')) this.y-=this.speed
        if(data.includes('Down')) this.y+=this.speed
        if(data.includes('Left')) this.x-=this.speed
        if(data.includes('Right')) this.x+=this.speed
    }
}

class Ball{
    constructor(ball) {
        this.x = ball?.x || Math.random() * 1000
        this.y = ball?.y || Math.random() * 1000
        this.speedX = 0
        this.speedY = 0
        setTimeout(this.initSpeed.bind(this), 1000)
    }

    initSpeed() {
        this.speedY = (Math.random() * 10) - 10
        this.speedX = (Math.random() * 10) - 10
    }

    update(maxX, maxY) {
        this.y+=this.speedY
        this.x+=this.speedX
        if(this.x < 0 | this.x > maxX) this.speedX = this.speedX * -1
        if(this.y < 0 | this.y > maxY) this.speedY = this.speedY * -1
    }
}

customElements.define('game-canvas', Game, { extends: 'canvas' })