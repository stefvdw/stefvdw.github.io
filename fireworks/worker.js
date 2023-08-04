self.onmessage = handleMessage

const pixels = new Array()
let renderInterval = null
let autoInterval = null
let width = 5000
let height = 5000

function handleMessage(event) {
    
    switch(event.data.type) {
        case 'start':
            width = event.data?.width || width
            height = event.data?.height || height
            if(event.data.auto) {
                autoInterval = setInterval(addPixel, isNaN(event.data.auto) ? 1500 : event.data.auto)
            }
            renderInterval = setInterval(render, 10)
        break
        case 'stop':
            clearInterval(renderInterval)
            clearInterval(autoInterval)
        break
        case 'input':
        let {x, y} = event.data
        addPixel(x,y)
        render()
        break
    }
}

function addPixel(x,y) {
    if(!x && !y) {
        x = Math.random() * width
        y = Math.random() * height
    }
    x = Math.round(x/10)*10
    y = Math.round(y/10)*10
    const color = getRandomColor()
    const pixel = {color,x,y}
    pixels.push([Object.assign({}, pixel),Object.assign({}, pixel),Object.assign({}, pixel),Object.assign({}, pixel)])
}

function render() {
    pixels.forEach(clearPixels)
    pixels.forEach(movePixels)
    self.postMessage(pixels.flat())
}

function movePixels(pixel) {
    const speed = 3
    pixel[0].x -= speed
    pixel[1].y -= speed
    pixel[2].x += speed
    pixel[3].y += speed
    return pixel
}

function clearPixels(fireworkevent, index) {
    if(fireworkevent.every(isPixelOut)) {
        pixels.splice(index,1)
    }
}

function isPixelOut(pixel) {
    return pixel.x < 0 || pixel.y < 0 || pixel.x > width || pixel.y > height
}

function getRandomColor() {
    const hue = Math.floor((new Date().getTime() /10) % 360)
    return `hsl(${hue}, 100%, 50%)`
}
