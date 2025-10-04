const Document=require('../models/document-model')

// for logged in user
const createDocument=async(req,res)=>{
    try {
        const document=req.body
        await Document.create(document)
        res.status(201).json("Document was successfully created")
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to create document"})
    }
}

//logged in user
const getDocuments=async(req,res)=>{
    try {
        const allDocuments=await Document.find({})
        res.status(200).json(allDocuments)
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to fetch documents"})
    }
}

// owner/editor
const updateDocument=async(req,res)=>{
    try {
        const {id}=req.params
        const document=req.body
        const updatedDocument=await Document.findByIdAndUpdate(id, document,{new:true})
        if(!updatedDocument)
        {
            res.status(404).json("No such document found")
        }
        res.status(200).json(updatedDocument)
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to updated document"})
    }
}

// owner
const deleteDocument=async(req,res)=>{
    try {
        const {id}=req.params
        const deletedDocument=await Document.findByIdAndDelete(id)
        if(!deletedDocument)
        {
            res.status(404).json("No such document found")
        }
        res.status(200).json("Successful deletion\n"+deletedDocument)
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to delete document"})
    }
}

module.exports={createDocument,getDocuments,updateDocument,deleteDocument}