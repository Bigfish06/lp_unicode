const mongoose = require('mongoose')

const documentVersionSchema = new mongoose.Schema(
{
    // we remove fields that won't change/unnecessary across version (createdBy, access, requests etc.)
    // we added documentID, createdAt and versionNumber
    documentID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true
    },

    createdAt: {
        type: Date, 
        default: Date.now
    },

    versionNumber: {
        type: Number,
        required: true
    },

    title:{
        type: String, 
        required: true
    },

    content:{
        type: String, 
        default: ""
    }
},
{
    timestamps: true
})

const DocumentVersion=mongoose.model('DocumentVersion',documentVersionSchema)
module.exports=DocumentVersion