// io function from the package lets us connect to a socket.io server
const io = require('socket.io-client')
const socket = io('http://localhost:5000')

socket.on('connect',()=>{
    socket.emit('joinDoc', {documentId:"11", userId:"22"})
})

socket.on('presence:update',(data)=>{
    console.log(`presence update: ${data}`)
})