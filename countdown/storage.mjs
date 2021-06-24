import Timer from '/timer.mjs'
import Snackbar from '/snackbar.mjs'

const list = document.forms['timers']
list.elements['load'].addEventListener('click', () => load())
list.elements['save'].addEventListener('click', () => save())

export const save = () => {
    let timers = Array.from(list.querySelectorAll('progress'))
    localStorage.setItem('savedTimers', JSON.stringify(timers))
    new Snackbar('Timers saved', 2000)
}

export const load = () => {
    let timers = localStorage.getItem('savedTimers')
    if(timers) {
        timers = JSON.parse(timers)
        list.clear()
        timers.forEach(timer => {
            list.append(new Timer(timer))
        })
        new Snackbar('Timers loaded')
    } else {
        new Snackbar('No saved timers found')
    }
}
