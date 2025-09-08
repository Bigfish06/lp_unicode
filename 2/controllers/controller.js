const User=require('../models/user-model')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
require('dotenv').config()

const register=async(req,res)=>{
    try {
        const body=req.body
        if(await User.findOne({username:body.username}))
        {
            res.status(404).json({message:"Username already taken"})
        }
        //a different salt is attached to every password
        //larger the number -> more strong salt -> more time
        //by default its 10 
        const salt=await bcrypt.genSalt();
        const hashedPassword=await bcrypt.hash(body.password,salt)
        //another way to do above is:
        //const hashedPassword=await bcrypt.hash(body.password,x(10 by default))
        
        const user={username:body.username,password:hashedPassword,email:body.email}
        User.create(user)
        res.status(201).json("User successfully created")
    } catch (error) {
        res.status(500).json({message:"bad",data:error.message})
    }
}

const login=async(req,res)=>{
    const body=req.body
    try {
        const accessToken=jwt.sign(body, process.env.ACCESS_TOKEN_SECRET)
        res.json({accessToken:accessToken})

        const user=await User.findOne({username:body.username})
        if(!user)
        {
            res.status(404).json("Username not found")
        }

        //first hashed one of DB, then input
        if(await bcrypt.compare(body.password,user.password))
        {
            res.status(200).json("Successfully logged in")
        }
        else 
        {
            res.status(404).json("Incorrect password")
        }
    } catch (error) {
        res.status(500).json({error:error.message,message:"Failed to login user"})
    }
}

module.exports={register,login}