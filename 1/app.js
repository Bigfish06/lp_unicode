// -------
// IMPORTS
// -------
const express=require('express')
const app=express()
const mongoose=require("mongoose")
const morgan=require('morgan')

const http = require('http')
const server = http.createServer(app)
// Server class from socket.io
const {Server} = require('socket.io')
const cors=require('cors')
const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})

require('dotenv').config()
require('./controllers/presence-controller')(io)


// ----------
// MIDDLEWARE
// ----------
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(morgan('tiny'))
//or we can specify what to store(a whole list of things):-
// morgan.token("host",(req,res)=>{
//     return req.hostname
// })
// app.use(morgan(':method :url :host'))
app.use(cors())


// ------
// ROUTES
// ------
const router=require('./routers/router')
app.use('/api/user',router)


// -----
// START
// -----
const address=process.env.mongoDB_url
mongoose.connect(address)
.then(()=>{
    console.log('Connection to the database was successful')
})
.catch(()=>{
    console.log('Connection to the database failed')
})

// shared http and websocket server
server.listen(5000,()=>{
    console.log('Server is listening on port 5000')
})