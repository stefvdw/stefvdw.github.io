class Bluetooth {
    device = null

    data = new Array()
    
    constructor() {
        
        console.log(this)
        this.uuids = new Map()
        this.uuids.set('00001800-0000-1000-8000-00805f9b34fb', 'Generic Access')
        this.uuids.set('00001801-0000-1000-8000-00805f9b34fb', 'Generic Attribute')
        this.uuids.set('00001802-0000-1000-8000-00805f9b34fb', 'Immediate Alert')
        this.uuids.set('00001803-0000-1000-8000-00805f9b34fb', 'Link Loss')
        this.uuids.set('00001804-0000-1000-8000-00805f9b34fb', 'Tx Power')
        this.uuids.set('00001805-0000-1000-8000-00805f9b34fb', 'Current Time Service')
        this.uuids.set('00001806-0000-1000-8000-00805f9b34fb', 'Reference Time Update Service')
        this.uuids.set('00001807-0000-1000-8000-00805f9b34fb', 'Next DST Change Service')
        this.uuids.set('00001808-0000-1000-8000-00805f9b34fb', 'Glucose')
        this.uuids.set('00001809-0000-1000-8000-00805f9b34fb', 'Health Thermometer')
        this.uuids.set('0000180a-0000-1000-8000-00805f9b34fb', 'Device Information')
        this.uuids.set('0000180d-0000-1000-8000-00805f9b34fb', 'Heart Rate')
        this.uuids.set('0000180e-0000-1000-8000-00805f9b34fb', 'Phone Alert Status Service')
        this.uuids.set('0000180f-0000-1000-8000-00805f9b34fb', 'Battery Service')
        this.uuids.set('00001810-0000-1000-8000-00805f9b34fb', 'Blood Pressure')
        this.uuids.set('00001811-0000-1000-8000-00805f9b34fb', 'Alert Notification Service')
        this.uuids.set('00001812-0000-1000-8000-00805f9b34fb', 'Human Interface Device')
        this.uuids.set('00001813-0000-1000-8000-00805f9b34fb', 'Scan Parameters')
        this.uuids.set('00001814-0000-1000-8000-00805f9b34fb', 'Running Speed and Cadence')
        this.uuids.set('00001815-0000-1000-8000-00805f9b34fb', 'Automation IO')
        this.uuids.set('00001816-0000-1000-8000-00805f9b34fb', 'Cycling Speed and Cadence')
        this.uuids.set('00001818-0000-1000-8000-00805f9b34fb', 'Cycling Power')
        this.uuids.set('00001819-0000-1000-8000-00805f9b34fb', 'Location and Navigation')
        this.uuids.set('0000181a-0000-1000-8000-00805f9b34fb', 'Environmental Sensing')
        this.uuids.set('0000181b-0000-1000-8000-00805f9b34fb', 'Body Composition')
        this.uuids.set('0000181c-0000-1000-8000-00805f9b34fb', 'User Data')
        this.uuids.set('0000181d-0000-1000-8000-00805f9b34fb', 'Weight Scale')
        this.uuids.set('0000181e-0000-1000-8000-00805f9b34fb', 'Bond Management Service')
        this.uuids.set('0000181f-0000-1000-8000-00805f9b34fb', 'Continuous Glucose Monitoring')
        this.uuids.set('00001820-0000-1000-8000-00805f9b34fb', 'Internet Protocol Support Service')
        this.uuids.set('00001821-0000-1000-8000-00805f9b34fb', 'Indoor Positioning')
        this.uuids.set('00001822-0000-1000-8000-00805f9b34fb', 'Pulse Oximeter Service')
        this.uuids.set('00001823-0000-1000-8000-00805f9b34fb', 'HTTP Proxy')
        this.uuids.set('00001824-0000-1000-8000-00805f9b34fb', 'Transport Discovery')
        this.uuids.set('00001825-0000-1000-8000-00805f9b34fb', 'Object Transfer Service')
        this.uuids.set('00001826-0000-1000-8000-00805f9b34fb', 'Fitness Machine')
        this.uuids.set('00001827-0000-1000-8000-00805f9b34fb', 'Mesh Provisioning Service')
        this.uuids.set('00001828-0000-1000-8000-00805f9b34fb', 'Mesh Proxy Service')
        this.uuids.set('00001829-0000-1000-8000-00805f9b34fb', 'Reconnection Configuration')    
    }
    
    async getDevice() {
        let services = ['battery_service']
        let filters = [{name: ['LYWSD03MMC']}]
        let optionalServices = ['battery_service', 'environmental_sensing', 'generic_access', 'ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6', 'ebe0ccc1-7a0a-4b0c-8a1a-6ff2997da3a6']
        
        this.device = await navigator.bluetooth.requestDevice({
            // acceptAllDevices: true,
            filters: filters,
            optionalServices: optionalServices
        })
    }

    async scan() {
        let scan = await navigator.bluetooth.requestLEScan({acceptAllAdvertisements:true})
        console.log(scan)
        navigator.bluetooth.onadvertisementreceived = console.log
    }
    
    async getPrimaryServices() {
        try {
            if(!this.device) throw new Error('No device')
            const server = await this.device.gatt.connect()
            const services = await server.getPrimaryServices()
            console.log(services)
            console.log(this.uuids)
            let textServices = services.map(service => {
                console.log(service.uuid, this.uuids.get(service.uuid))
                return this.uuids.get(service.uuid)
            })
            console.log(textServices)
            
            
        } catch (error) {
            console.error(error)
        }
    }
    
    async connect() {
        try {
            if(!this.device) throw new Error('No device')
            this.device.gatt.connect()
        } catch (error) {
            console.error(error)
        }
    }
    
    async getBatteryStatus() {
        try {
            console.group('Battery')
            console.log('connect to gatt server')
            debugger
            const server = await this.device.gatt.connect()
            
            console.log('Getting Battery Service...')
            const service = await server.getPrimaryService('battery_service')
            
            console.log('Getting Battery Level Characteristic...')
            const characteristic = await service.getCharacteristic('battery_level')
            
            console.log('Reading Battery Level...')
            const value = await characteristic.readValue()
            
            console.log('> Battery Level is ' + value.getUint8(0) + '%')
            console.groupEnd('Battery')
        } catch (error) {
            console.log(error)
        }
        
    }

    async getNotifications() {
        try {
            console.group('Value change')
            console.log('connect to gatt server')
            debugger
            const server = await this.device.gatt.connect()
            const services = await server.getPrimaryServices()
            let table = {}

            for (const service of services) {
                console.log(service.uuid)
                let characteristics = await service.getCharacteristics()

               
                for (const characteristic of characteristics) {
                    table[characteristic.uuid] = characteristic.properties

                    // let characteristic = await service.getCharacteristic(service.uuid)
                    if(characteristic.properties.notify) {

                        let button = document.createElement('button')
                        button.innerText = characteristic.uuid
                        button.onclick = async () => {
                            console.log(characteristic)
                            await characteristic.startNotifications()
                            characteristic.addEventListener('characteristicvaluechanged', this.handleValueChanged.bind(this))
                        }
                        document.body.append(button)
                        
                    }

                    if(characteristic.properties.read) {
                        const value = await characteristic.readValue()
                        console.log(characteristic.uuid, this.getHexValue(value))
                    }
                }
            }
            console.table(table)

        } catch (error) {
            console.log(error)
        }
        console.groupEnd('Value change')
        
    }

    getHexValue(dataview) {
        let raw = []
        for (let i = 0; i < dataview.byteLength; i++) {
            let hex = '0x' + ('00' + dataview.getUint8(i).toString(16)).slice(-2)
            raw.push(parseInt(hex))
            // a.push(parseInt(hex))
        }

        return raw
    }

    async getLiveTemperatureAndHumidity() {
        try {
            const server = await this.device.gatt.connect()
            const service = await server.getPrimaryService('ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6')
            const characteristic = await service.getCharacteristic('ebe0ccc1-7a0a-4b0c-8a1a-6ff2997da3a6')
            await characteristic.startNotifications()
            characteristic.addEventListener('characteristicvaluechanged', (event) => {
                let dataview = event.target.value
                let temp = dataview.getUint16(0, true) / 100
                let humidity = dataview.getUint8(2)
                let batt = dataview.getUint16(3, true) / 1000
                // let raw = []
                // for (let i = dataview.byteLength; i < 1; i--) {
                //     let hex = '0x' + ('00' + dataview.getUint8(i).toString(16)).slice(-2)
                //     raw.push(parseInt(hex))
                // }
                console.log(temp, humidity, batt)
            })
        } catch (error) {
            
        }
    }
    
    async getTemperatureStatus() {
        try {
            console.group('Temperature')
            console.log('connect to gatt server')
            debugger
            const server = await this.device.gatt.connect()
            
            console.log('Getting Service uuid: ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6')
            const service = await server.getPrimaryService('ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6')
            
            console.log('Getting Temperature Level Characteristic...')
            const characteristic = await service.getCharacteristic('ebe0ccbc-7a0a-4b0c-8a1a-6ff2997da3a6')
            
            
            await characteristic.startNotifications()
            characteristic.addEventListener('characteristicvaluechanged', this.handleTempData.bind(this));
            
            // console.log('Reading Battery Level...')
            // const value = await characteristic.readValue()
            
            // console.log('> Temperature is ' + value.getUint8(0) + '%')
            console.groupEnd('Temperature')
        } catch (error) {
            console.log(error)
        }
        
    }

    handleValueChanged() {
        let value = event.target.value
        console.log(this.getHexValue(event.target.value))
    }
    
    handleTempData(event) {
        let value = event.target.value
        // console.log(value)
    

        // Convert raw data bytes to hex values just for the sake of showing something.
        // In the "real" world, you'd use data.getUint8, data.getUint16 or even
        // TextDecoder to process raw data bytes.

        let index = parseInt('0x' + ('00' + value.getUint8(0).toString(16)).slice(-2))
        let temperature = parseInt('0x' + ('00' + value.getUint8(8).toString(16)).slice(-2))/10
        let humidity = parseInt('0x' + ('00' + value.getUint8(10).toString(16)).slice(-2))

        // console.log(value.getUint16(4))

        let raw = this.getHexValue(value)
        console.log(raw)

        this.printTable(raw)

        this.data[index] = {
            humidity: humidity,
            temperature: temperature,
            raw: raw
        }
        localStorage.setItem('data', JSON.stringify(this.data))
    }

    printTable(data) {
        let row = document.createElement('tr')
        document.querySelector('table').append(row)
        data.forEach(point => {
            let cell = document.createElement('td')
            cell.innerHTML = point
            row.append(cell)
        })

    }
}

export default Bluetooth = new Bluetooth()