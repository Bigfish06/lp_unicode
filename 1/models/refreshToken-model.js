const mongoose=require('mongoose')

const refreshTokenSchema=new mongoose.Schema({
    //always good to use only _id (keep it lightweight)
    //userId is a reference to _id of User
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    token:{
        type:String, 
        required: true
    }
})

const RefreshToken=mongoose.model('RefreshToken',refreshTokenSchema)
module.exports=RefreshToken