const mongoose=require('mongoose')

const userSchema=new mongoose.Schema(
{
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
        // regex for 1 up, 1 dig, 1 special
        match: [/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/,"Password must contain at least one uppercase letter, one numeric digit, and one special character."],
        //we can also do so 
        minlength: [8,"Password must have atleast 8 characters"]
    }
},
{
    timestamps:true
}
)

const User=mongoose.model('User',userSchema)
module.exports=User