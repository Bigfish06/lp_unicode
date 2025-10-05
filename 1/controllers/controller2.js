require('dotenv').config()

const User=require('../models/user-model')
const RefreshToken=require('../models/refreshToken-model')

const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const {Resend}=require('resend')
const resend=new Resend(process.env.RESEND_API_KEY)

const generateAccessToken=(user)=>{
    return jwt.sign({username:user.username, _id:user._id} ,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"2000s"})
}

const refresh=async(req,res)=>{
    try {
        const refreshToken=req.body.refreshToken
        if(!refreshToken)
        {
            return res.status(404).json("Please provide refreshToken")
        }

        //ensures refreshToken is in our DB
        const RT=await RefreshToken.findOne({token:refreshToken})
        if(!RT)     
        {
            return res.status(404).json("Invalid refresh token")
        }
        //ensures user still exists
        const user=await User.findById(RT.userId)
        if(!user)     
        {
            return res.status(404).json("Invalid refresh token")
        }
        //ensures refreshToken wasn't tampered with
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
        
        //to use validate we have to make a new instance
        const tempUser=new User({username:body.username, password:body.password, email: body.email, dob:body.dob, credit_scores:body.credit_scores, name:body.name})
        //validate is an important method to check schema input errors
        //validation error is only for match, minlength(max), required, and for uniqueness(of email or username we have to do it separately)
        
        await tempUser.validate()

        // regex for 1 up, 1 dig, 1 special
        // we do password validation here, as we only store hashed version in the db
        const passwordRegex=/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/
        if(!passwordRegex.test(tempUser.password))
        {
            return res.status(404).json("Password must contain at least one uppercase letter, one numeric digit, and one special character.")
        }
        if(tempUser.password.length<8)
        {
            return res.status(404).json("Password must be atleast 8 characters long")
        }

        //a different salt is attached to every password
        //larger the number -> more strong salt -> more time
        //by default its 10 
        const salt=await bcrypt.genSalt(); 
        const hashedPassword=await bcrypt.hash(body.password,salt)
        //another way to do above is:
        //const hashedPassword=await bcrypt.hash(body.password,x(10 by default))
        
        try {
            const user=await User.create({username:body.username, password:hashedPassword, email: body.email, dob:body.dob, credit_scores:body.credit_scores, name:body.name})
            await registerEmailer(user.username, user.email)
        } catch (error) {
            return res.status(400).json({message:`Duplicate entry detected`,data: error.keyValue})
        }        

        res.status(201).json("User successfully created and welcome email sent")
    } catch (error) {
        if(error.name==="ValidationError")
        {
            let messages={}
            for(let field in error.errors)
            {
                messages[field]=error.errors[field].message
            }
            return res.status(404).json({message:"Invalid credentials", data: messages})
        }

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

        //first input, then hashed in DB
        if(!await bcrypt.compare(body.password,user.password))
        {            
            return res.status(404).json("Incorrect password")
        }

        //create token
        const accessToken=generateAccessToken(user)
        const refreshToken=jwt.sign({username:user.username, _id:user._id}, process.env.REFRESH_TOKEN_SECRET)
        await RefreshToken.create({token:refreshToken, userId:user._id})
        loginEmailer(user.username,user.email)        

        res.status(200).json({message:"Successfully logged in",accessToken:accessToken,refreshToken:refreshToken})
    } catch (error) {
        res.status(500).json({error:error.message,message:"Failed to login user"})
    }
}

const showProfile=(req,res)=>{
    res.status(200).json("Welcome "+req.user.username)
}

const deleteRefreshTokens=async(req,res)=>{
    try {
        const {refreshToken}=req.params
        if(!refreshToken)
        {
            res.status(404).json("Please provide refresh token")
        }
        if(await RefreshToken.findOneAndDelete({token:refreshToken}))
        {
            res.status(200).json("Successfully deleted refresh tokens")
        }
        else
        {
            res.status(404).json("Invalid refresh token")
        }        
    } catch (error) {
        res.status(500).json("Failed to logout user")
    }    
}

const registerEmailer=async(username,email)=>{
    await resend.emails.send({
    from: process.env.WEBSITE_EMAIL,
    to: email,
    subject: 'Registration done on my website',
    html: `<p>Welcome ${username} to my website. Thank you for registering</p>`
    });
}

const loginEmailer=async(username,email)=>{
    await resend.emails.send({
    from: process.env.WEBSITE_EMAIL,
    to: email,
    subject: 'Login on my website',
    html: `<p>Hello ${username}! A login was detected on my website, if it was you, please ignore</p>`
    });
}

module.exports={register,login,showProfile,refresh,deleteRefreshTokens}