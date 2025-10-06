const mongoose=require('mongoose')

const userSchema=new mongoose.Schema(
{
    name:{
        type:String, 
        required: true
    },
    username:{
        type:String, 
        required: [true,"Please enter username"],
        unique: [true,"Username already taken"],
    },
    email:{
        type:String, 
        required: [true,"Please enter email"],
        unique:[true,"Email already used"],
        //must contain a @
        match: [/@/,"Invalid email"]
    },
    password:{
        type: String, 
        required: [true,"Please enter password"],
    },
    dob:{
        type:Date, 
        required: true
    },
    credit_scores:{
        type:Number, 
        required: true
    },
    profileIcon:{
        type:String, 
        default: null
    }
},
{
    timestamps:true
}
)

const User=mongoose.model('User',userSchema)
module.exports=User