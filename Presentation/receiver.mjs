export default class Receiver {
    constructor() {
        if (!navigator.presentation.receiver) throw new Error('Not a receiver')
        this.connections = []
        this.init()
    }

    async init() {
        this.list = await navigator.presentation.receiver.connectionList
        this.list.connections.map(this.addConnection.bind(this))
        this.list.addEventListener('connectionavailable', (event) => this.addConnection(event.connection))
    }

    addConnection(connection) {
        this.connections.push(connection)
        console.log(this.connections)
        let stats = Object.groupBy(this.connections, (connection) => connection.state)
        stats = Object.entries(stats).map(([status, connections]) => `${status}:${connections.length}`).join('|')
        console.log(stats)

        let url = new URL("/Presentation", location)
        
        url.hash = connection.id

        document.body.innerHTML = `<image src="https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${url}"><hr>${url}<br>${stats}`
        connection.addEventListener('message', this.handleMessage.bind(this))

    }

    handleMessage(event) {
        const message = event.data
        const id = event.target.id

        console.log(id, 'send', message)
    }
}