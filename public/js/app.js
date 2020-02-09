const socket = io() 

//Elements
const $messageForm = document.querySelector('#message-form')
const $sendLocation = document.querySelector('#send-location')
const $inputFormMessage = document.querySelector('input')
const $buttonFormMessage = document.querySelector('button')
const $messages = document.querySelector('#messages')
const $joinForm = document.querySelector('#join-form')
const $sidebar = document.querySelector('#sidebar')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const autoScroll = () => {
    //get the latest message
    const newMessage = $messages.lastElementChild

    //get new message height 
    const styles = getComputedStyle(newMessage)
    const margin = parseInt(styles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + margin

    //visible height 
    const visibleHeight = $messages.offsetHeight

    //message container height
    const containerHeight = $messages.scrollHeight

    //How far i have scrolled. My current scroll position
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message, userName) => {
    const template = Mustache.render($messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a"),
        userName
    })
    $messages.insertAdjacentHTML('beforeend', template)
    autoScroll()
})

socket.on('locationMessage', (url, userName) => {
    const html = Mustache.render($locationTemplate, {
        location: url.text,
        createdAt: moment(url.createdAt).format("h:mm a"),
        userName
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    }) 
    $sidebar.innerHTML = html
})

socket.emit('join',
    Qs.parse(location.search, { ignoreQueryPrefix: true }),
    (error) => {
        if (error) {
            alert(error)
            location.href = '/'
        }
    })

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //let message = document.querySelector('input').value
    $buttonFormMessage.setAttribute('disabled', 'disabled')
    let message = e.target.elements.message.value
    socket.emit('updateMessage',
    message,
    (msg) => {
        $inputFormMessage.value = ''
        $inputFormMessage.focus()
    })
    $buttonFormMessage.removeAttribute('disabled')
})

$sendLocation.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocations not supported!')
    }

    $sendLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition(location => {
        socket.emit('location',
        {
            latitudes: location.coords.latitude,
            longitudes: location.coords.longitude
        },
        (message) => {
            console.log(`Location ${message}`)
        })
    })
    $sendLocation.removeAttribute('disabled')
})