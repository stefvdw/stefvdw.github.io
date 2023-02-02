export default class File {
    constructor(options = {multiple: false}) {
        this.fileHandle
        this.content = ''
        this.options = options 

        if(!window) return this
        if ('launchQueue' in window) {        
            launchQueue.setConsumer((launchParams) => {
                this.fileHandle = launchParams.files[0]
                this.loadFile()
            })
        } else {
            alert('File handling API is not supported!')
        }

        window.addEventListener('dragover', (e) => e.preventDefault())
        window.addEventListener('drop', this.onDrop.bind(this))
    }

    async onDrop(event) {
        event.preventDefault()
        const fileHandlesPromises = [...event.dataTransfer.items]
              .filter((item) => item.kind === 'file')
              .map((item) => item.getAsFileSystemHandle())
        for await (const handle of fileHandlesPromises) {
            if (handle.kind === 'directory') continue
            this.fileHandle = handle
            this.loadFile()
            return
        }
    }

    async loadFile() {
        try {
            if(!this.fileHandle) throw new Error('No file handle')
            console.log(`Opening ${this.fileHandle.name}`)
            if(!await this.verifyPermission(this.fileHandle, true)) throw new Error('No file wread write permission')
            const file = await this.fileHandle.getFile()
            this.content = await file.text()   
            return this.content
        } catch (error) {
            alert(error)
        }
    }

    async open() {
        [this.fileHandle] = await window.showOpenFilePicker(this.options)
        return this.loadFile()
    }

    async save() {
        try {
            if(!this.fileHandle) {
                this.fileHandle = await window.showSaveFilePicker(this.options)
            }
            const writable = await this.fileHandle.createWritable()
            await writable.write(this.content)
            await writable.close()
            this.dispatchEvent(new Event('saved'))
        } catch (error) {
            alert(error)
        } finally {
            console.log('done')
        }

    }

    async verifyPermission(fileHandle, readWrite) {
        const options = {};
        if (readWrite) {
          options.mode = 'readwrite';
        }
        // Check if permission was already granted. If so, return true.
        if ((await fileHandle.queryPermission(options)) === 'granted') {
          return true;
        }
        // Request permission. If the user grants permission, return true.
        if ((await fileHandle.requestPermission(options)) === 'granted') {
          return true;
        }
        // The user didn't grant permission, so return false.
        return false;
      }
}