const html = String.raw

export default class TempHumSensor extends HTMLElement {

    static template(state) {
        return html`
        <div>${state.temperature}&deg;C</div>
        <div>${state.humidity}%</div>
        <div class="battery">
            <meter value="${state.battery}" min="2.5" max="3" low="2.7"></meter>
        </div>
        `
    }

    constructor() {
        super()
        this.innerText = 'Click to connect'        
        this.onclick = this.listen.bind(this)
    }

    async listen() {
        const filters = [{name: ['LYWSD03MMC']}]
        const optionalServices = ['ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6', 'ebe0ccc1-7a0a-4b0c-8a1a-6ff2997da3a6']
        
        this.device = await navigator.bluetooth.requestDevice({
            filters: filters,
            optionalServices: optionalServices
        })
        this.device.ongattserverdisconnected = () => this.classList.add('disconnected')
        this.innerText = 'Connecting...'
        this.server = await this.device.gatt.connect()
        this.classList.remove('disconnected')
        const service = await this.server.getPrimaryService('ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6')
        this.listener = await service.getCharacteristic('ebe0ccc1-7a0a-4b0c-8a1a-6ff2997da3a6')
        await this.listener.startNotifications()
        this.innerText = 'Waiting for data...'
        this.listener.oncharacteristicvaluechanged = this.handleValue.bind(this)
        this.onclick = null
    }

    handleValue(event) {
        const dataview = event.target.value
        this.temperature = dataview.getUint16(0, true) / 100
        this.humidity = dataview.getUint8(2)
        this.battery = dataview.getUint16(3, true) / 1000
        this.render()
    }

    render() {
        this.innerHTML = TempHumSensor.template(this)
    }

}

window.customElements.define('temp-hum-sensor', TempHumSensor)