const express=require('express')
const app=express()
const mongoose=require("mongoose")
const morgan=require('morgan')
require('dotenv').config()

const address = process.env.mongoDB_url;
mongoose.connect(address)
.then(()=>{
    console.log('Connection to the database was successful')
})
.catch(()=>{
    console.log('Connection to the database failed')
})
app.listen(5000,(req,res)=>{
    console.log('Server is listening on port 5000')
})

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(morgan('tiny'))

const router=require('./routers/router')
app.use('/',router)