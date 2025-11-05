export default class Game extends PresentationRequest {
    constructor() {
        super(['/receiver.html'])
        navigator.presentation.defaultRequest = this

        this.connection = null

        this.addEventListener('connectionavailable', this.setConnection.bind(this))

        this.getAvailability().then(availability => availability.addEventListener('change', console.log))


    }

    setConnection(event) {
        this.connection = event.connection
        this.connection.addEventListener('message', this.handleMessage.bind(this))
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
        if(!this.connection) return
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