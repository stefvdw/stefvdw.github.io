

export default class Controller extends PresentationRequest {
    constructor() {
        super(['./receiver.html'])
        navigator.presentation.defaultRequest = this
        this.keys = new Set()

        this.connection = null

        this.addEventListener('connectionavailable', this.setConnection.bind(this))
        window.addEventListener('keydown', this.handleKeyDown.bind(this))
        window.addEventListener('keyup', this.handleKeyUp.bind(this))

        this.getAvailability().then(availability => availability.addEventListener('change', console.log))

    }

    setConnection(event) {
        this.connection = event.connection
        window.hash = this.connection.id
        this.connection.addEventListener('message', this.handleMessage.bind(this))
        this.startKeyStream()
    }

    handleKeyDown(event) {
        this.keys.add(event.key)
    }
    
    handleKeyUp(event) {
        this.keys.delete(event.key)
    }

    startKeyStream() {
        requestAnimationFrame(this.sendKeys.bind(this))
    }
    
    sendKeys() {
        let keys = [...this.keys].join(' ')
        this.send(keys)
        requestAnimationFrame(this.sendKeys.bind(this))
    }
    
    handleMessage(event) {

    }

    terminate() {
        if(!this.connection) return
        this.connection.terminate()
        this.connection = null
    }

    close() {
        if(!this.connection) return
        this.connection.close()
    }

    send(data) {
        if(this.connection?.state !== 'connected') return
        this.connection.send(data)
    }

    async join(id) {
        if(this.connection) return
        this.connection = await super.reconnect(id)
    }

    reconnect() {
        if(!this.connection) return
        super.reconnect(this.connection.id)
    }
}