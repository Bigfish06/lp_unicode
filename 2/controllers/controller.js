const User=require('../models/user-model')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const {Resend}=require('resend')
require('dotenv').config()
const resend=new Resend(process.env.RESEND_API_KEY)

let refreshTokens=[]

const generateAccessToken=(user)=>{
    return jwt.sign({username:user.username}, process.env.ACCESS_TOKEN_SECRET,{expiresIn:"30s"})
}

const refresh=(req,res)=>{
    try {
        const refreshToken=req.body.refreshToken
        if(!refreshToken)
        {
            return res.status(404).json("Please provide refreshToken")
        }

        if(!refreshTokens.includes(refreshToken))        //not in DB
        {
            return res.status(404).json("Invalid refresh token")
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
            if(err)
            {
                return res.status(403).json("Invalid refresh token")
            }
            const accessToken=generateAccessToken(user)
            res.status(200).json({message:"Successfully refreshed",accessToken:accessToken})
        })
    } catch (error) {
        res.status(500).json({message:"Failed to refresh token",data:error.message})
    }
}

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

        registerEmailer(user.username, user.email)

        res.status(201).json("User successfully created and welcome email sent")
    } catch (error) {
        res.status(500).json({message:"Failed to register",data:error.message})
    }
}

const login=async(req,res)=>{
    const body=req.body
    try {
        const user=await User.findOne({username:body.username})
        if(!user)
        {
            return res.status(404).json("Username not found")
        }

        //first hashed one of DB, then input
        if(!await bcrypt.compare(body.password,user.password))
        {
            return res.status(404).json("Incorrect password")
        }

        //create token
        const accessToken=generateAccessToken(user)
        const refreshToken=jwt.sign({username:user.username}, process.env.REFRESH_TOKEN_SECRET)
        refreshTokens.push(refreshToken)
        loginEmailer(user.username,user.email)        

        res.status(200).json({message:"Successfully logged in",accessToken:accessToken,refreshToken:refreshToken})
    } catch (error) {
        res.status(500).json({error:error.message,message:"Failed to login user"})
    }
}

const showProfile=(req,res)=>{
    res.status(200).json("Welcome "+req.user.username)
}

const deleteRefreshTokens=(req,res)=>{
    refreshTokens=refreshTokens.filter(token=>token!==req.body.refreshToken)
    res.status(200).json("Successfully deleted refresh tokens")
}

const registerEmailer=async(username,email)=>{
    await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Registration done on my website',
    html: `<p>Welcome ${username} to my website. Thank you for registering</p>`
    });
}

const loginEmailer=async(username,email)=>{
    await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Login on my website',
    html: `<p>Hello ${username}! A login was detected on my website, if it was you, please ignore</p>`
    });
}

module.exports={register,login,showProfile,refresh,deleteRefreshTokens}