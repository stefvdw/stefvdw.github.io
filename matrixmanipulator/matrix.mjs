import File from './file.mjs'
import filters from './filters.json' assert { type: 'json' }

class Matrix extends File {
    constructor() {
        super({
            id: 'matrix',
            multiple: false,
            types: [{description: 'Matrix file', accept: {'text/xml': ['.matrix']}}]
        })

        
    }

    get content() {
        if(this.xml) {
            return new XMLSerializer().serializeToString(this.xml)
        } else {
            return undefined
        }
    }

    set content(content) {
        this.xml = new DOMParser().parseFromString(content, "application/xml")
        if(this.name) {
            document.title = this.name
        }
        return this.xml
    }

    get name() { return this.xml?.querySelector('CoefficientFactors')?.getAttribute('Name') || undefined }

    set name(value) {
        if(value && document.title) {
            document.title = value
            this.xml?.querySelector('CoefficientFactors')?.setAttribute('Name', value)
        }
        return value
    }

    get type() { return this.xml?.querySelector('CoefficientFactors')?.getAttribute('CarrierSize') || 96 }

    set type(value) {
        value = value == "96" ? "96" : "384"
        this.xml?.querySelector('CoefficientFactors')?.setAttribute('CarrierSize', value)
        return value
    }

    get version() { return this.xml?.querySelector('*|Channel')?.getAttribute('InstrumentVersion') || 'New' }

    set version(value) {
        const isNew = value == "New"
        value = isNew ? "New" : "Old"
        if(!this.xml) return
        const channels = Array.from(this.xml.querySelectorAll('*|Channel'))
        if(!channels) return
        for (const channel of channels) {
            const name = channel.getAttribute('x:Name')
            channel.setAttribute('InstrumentVersion', value)
            channel.setAttribute('DetectorId', 'Wavelength' + filters[name][value.toLowerCase()].detector)
            channel.setAttribute('EmitterId', 'Wavelength' + filters[name][value.toLowerCase()].emitter)
        }
        return value
    }

    get coefficients() {
        let coefficients = this.xml?.getElementsByTagName('Coefficient') || []
        const result = new Array()
        for (const coefficient of coefficients) {
            const origin = (coefficient.getElementsByTagName('Coefficient.Origin')[0]?.firstElementChild?.getAttribute('x:Name') || coefficient.getAttribute('Origin').slice(13, -1)).toUpperCase().trim()
            const affected = (coefficient.getElementsByTagName('Coefficient.Affected')[0]?.firstElementChild?.getAttribute('x:Name') || coefficient.getAttribute('Affected').slice(13, -1)).toUpperCase().trim()
            const factor = Math.abs(Number.parseFloat(coefficient.getAttribute('Factor')) || 0 )
            // console.log(`${origin} into ${affected} = ${factor}`)
            result.push({origin, affected, factor, coefficient})
        }
        return result
    }

    async loadTemplate(templateURL) {
        const result = await fetch(templateURL)
        let templatecontent = await result.text()
        this.xml = new DOMParser().parseFromString(templatecontent, 'text/xml')
    }

    async save(options = {}) {
        const {name, type} = options
        if(name) {
            this.name = name
        }
        if(!this.content) {
            await this.loadTemplate('./standard96.template')
        }
        super.save()
    }
}

export default new Matrix()