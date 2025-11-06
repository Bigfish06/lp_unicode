const mongoose=require('mongoose')

const presenceSchema=new mongoose.Schema(
{
    documentId:{
        type:String, 
        required: true
    },
    users:[
        {
            clientId:{
                type:String, 
                required:true
            },
            userId:{
                type:String, 
                required:true
            },
            lastActiveAt:{
                type:Date
            },
        }
    ]
},
{
    timestamps:true
}
)

const PresenceSchema=mongoose.model('User',presenceSchema)
module.exports=PresenceSchema