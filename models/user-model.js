const mongoose=require('mongoose')
const userSchema=new mongoose.Schema(
{
    name:{
        type:String, 
        required: true
    },
    email:{
        type:String, 
        required: true
    },
    dob:{
        type:Date, 
        required: true
    },
    credit_scores:{
        type:Number, 
        required: true
    }
},
{
    timestamps:true
}
)

const User=mongoose.model('User',userSchema)
module.exports=User