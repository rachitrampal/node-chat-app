const path = require('path')
const http = require('http')
const express = require('express')
const socket = require('socket.io')
const app = express()
const {generateMessage} = require('./utils/messages')
const {addUser, getUserById, getUsersInRoom, removeById} = require('./utils/user')

const server = http.createServer(app)
const io = socket(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

app.use(express.json())

io.on('connection', (socket) => {
     //socket.broadcast.emit('message', generateMessage('A new user has joined!'))
     
     socket.on('join', ({username, room}, callback) => {
          socket.join(room)
          const user = addUser({id: socket.id, userName: username, room})
          if (user.error) {
              return callback(user.error)
          }
          socket.emit('message', generateMessage('Welcome!'), 'Admin')
          socket.broadcast.to(user.room).emit('message', generateMessage(`${user.userName} has joined!`), 'Admin')
          io.to(user.room).emit('roomData', {
               room: user.room,
               users: getUsersInRoom(user.room)
          })
          callback()
     })
     
     socket.on('updateMessage', (message, callback) => {
          const user = getUserById(socket.id) 
          if (user) {
               io.to(user.room).emit('message', generateMessage(message), user.userName)
               callback('Delivered!')
          }
     })

     socket.on('location', (location, callback) => {
          const user = getUserById(socket.id) 
          if (user) {
          io.emit('locationMessage',
               generateMessage(`https://google.com/maps?q=${location.latitudes},${location.longitudes}`),
               user.userName)
          callback('Shared!')
          }
     })

     socket.on('disconnect', () => {
          const user = removeById(socket.id)
          if (user) {
               io.to(user.room).emit('message', generateMessage(`${user.userName} has left!`))
          }
     })
})

server.listen(port, () => {
     console.log(`App is listening on the: ${port}`)
})

