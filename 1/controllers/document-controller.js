const Document=require('../models/document-model')

const createDocument=async(req,res)=>{
    try {
        const document=req.body
        await Document.create(document)
        res.status(201).json("Document was successfully created")
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to create document"})
    }
}

//next 3 methods have the documentAuthorizer middleware before, which attached req.document
// however, if we are using req.document, we have to make sure we do await req.document.save()
// after every change, so i choose not to for document, otherwise for req.user it won't have changes
const getDocuments=async(req,res)=>{
    try {
        const allDocuments=await Document.find({})
        res.status(200).json(allDocuments)
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to fetch documents"})
    }
}

const updateDocument=async(req,res)=>{
    try {
        const {id}=req.params
        const document=req.body
        const updatedDocument=await Document.findByIdAndUpdate(id, document,{new:true})
        res.status(200).json(updatedDocument)
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to updated document"})
    }
}

const deleteDocument=async(req,res)=>{
    try {
        const {id}=req.params
        const deletedDocument=await Document.findByIdAndDelete(id)
        res.status(200).json({message: "Successful deletion ",deletedDocument})
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to delete document"})
    }
}

module.exports={createDocument,getDocuments,updateDocument,deleteDocument}