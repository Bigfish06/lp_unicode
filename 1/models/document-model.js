const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema(
{
    title:{
        type: String, 
        required: true
    },

    content:{
        type: String, 
        default: ""
    },

    createdBy:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true
    }, 

    access:{
        // view arr and edit arr
        view: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        edit: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },

    // for each request for the doc, we store 
    // who, viewer/editor, status of the request
    requests:[{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        type:{
            // enum says one of these values
            type: String, enum: ["view","edit"], 
            required: true
        },
        status:{
            type: String, enum:["pending","approved","rejected"],
            default: "pending"
        }
    }]
},
{
    timestamps: true
})

const Document=mongoose.model('Document',documentSchema)
module.exports=Document