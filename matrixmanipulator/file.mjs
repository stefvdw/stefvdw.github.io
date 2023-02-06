import IDB from './idb.mjs'

export default class File extends EventTarget {
    constructor(options = {multiple: false}) {
        super()
        this.fileHandle
        this.content
        this.options = options 

        if(!window) return this
        if ('launchQueue' in window) {        
            launchQueue.setConsumer((launchParams) => {
                this.fileHandle = launchParams.files[0]
                this.loadFile()
            })
        } else {
            throw new Error('File handling API is not supported!')
        }

        window.addEventListener('dragover', (e) => e.preventDefault())
        window.addEventListener('drop', this.onDrop.bind(this))
    }

    get recents() {
        return IDB.getAll()
    }

    async onDrop(event) {
        event.preventDefault()
        const fileHandlesPromises = [...event.dataTransfer.items]
              .filter((item) => item.kind === 'file')
              .map((item) => item.getAsFileSystemHandle())
        for await (const handle of fileHandlesPromises) {
            if (handle.kind === 'directory') continue
            this.fileHandle = handle
            await this.loadFile()
            return
        }
    }

    async storeHandle() {
        if(!this.fileHandle) return false
        let alreadyExists = false
        for (const recent of await this.recents) {
            if(await recent.handle.isSameEntry(this.fileHandle)) {
                console.log('file already stored')
                alreadyExists = true
                return
            }
        }    
        
        if(!alreadyExists) {
            IDB.set({handle: this.fileHandle, name: this.fileHandle.name, date: new Date()})
        }
    }

    async loadFile() {
        try {
            if(!this.fileHandle) throw new Error('No file handle')
            console.log(`Opening ${this.fileHandle.name}`)
            const file = await this.fileHandle.getFile()
            this.content = await file.text()
            this.dispatchEvent(new Event('load'))
            await this.storeHandle()
            return this.content
        } catch (error) {
            alert(error)
        }
    }

    async open(handle) {
        if(handle) {
            this.fileHandle = handle
        } else {
            [this.fileHandle] = await window.showOpenFilePicker(this.options)
        }
        return this.loadFile()
    }

    async save() {
        try {
            if(!this.fileHandle) {
                this.fileHandle = await window.showSaveFilePicker(this.options)
            }
            if(!await this.verifyPermission(this.fileHandle, true)) throw new Error('No file read write permission')
            const writable = await this.fileHandle.createWritable()
            await writable.write(this.content)
            await writable.close()
            this.dispatchEvent(new Event('saved'))
            await this.storeHandle()
        } catch (error) {
            alert(error)
        } finally {
            console.log('done')
        }
    }

    async verifyPermission(readWrite) {
        if(!this.fileHandle) return false
        const options = {}
        if (readWrite) {
          options.mode = 'readwrite'
        }
        // Check if permission was already granted. If so, return true.
        if ((await this.fileHandle.queryPermission(options)) === 'granted') {
          return true
        }
        // Request permission. If the user grants permission, return true.
        if ((await this.fileHandle.requestPermission(options)) === 'granted') {
          return true
        }
        // The user didn't grant permission, so return false.
        return false
      }
}