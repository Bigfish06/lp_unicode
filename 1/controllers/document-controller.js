// to get differences, we'll use it for diffLines
const diff=require('diff')

const Document=require('../models/document-model')
const DocumentVersion=require('../models/document-version-model')

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

        // save this version before the update
        // but before this, we need to calculate versionNumber
        const currentDocument = await Document.findById(id)

        const versionCount = await DocumentVersion.countDocuments({documentID:id})
        await DocumentVersion.create({
            documentID: id, 
            createdAt: Date.now(),
            versionNumber: versionCount+1,
            title: currentDocument.title,
            content: currentDocument.content
        })

        const updatedDocument=await Document.findByIdAndUpdate(id, document,{new:true})
        res.status(200).json(updatedDocument)
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to update document"})
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

const viewDocumentHistory=async(req,res)=>{
    try {
        const {id}=req.params
        const allDocuments=await DocumentVersion.find({documentID:id})
        .sort({versionNumber:-1})       // sort in descending order
        res.status(200).json(allDocuments)
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to view document history"})
    }
}

const restorePreviousVersion=async(req,res)=>{
    try {
        const {id, versionNumber}=req.params
        const document=req.document
        
        const restoredVersion=await DocumentVersion.findOne({documentID:id, versionNumber:versionNumber})
        if(!restoredVersion)
        {
            res.status(404).json("Incorrect version number provided")
            return;
        }

        // save current version first, then restore
        const versionCount = await DocumentVersion.countDocuments({documentID:id})
        await DocumentVersion.create({
            documentID: id, 
            createdAt: Date.now(),
            versionNumber: versionCount+1,
            title: document.title,
            content: document.content
        })

        document.createdAt=restoredVersion.createdAt
        document.title=restoredVersion.title
        document.content=restoredVersion.content

        const newVersion=await document.save()
        res.status(200).json(newVersion)
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to restore previous version of document"})
    }
}

const compareVersions=async(req,res)=>{
    try {
        const {id, versionNumber1, versionNumber2}=req.params
        const version1=await DocumentVersion.findOne({documentID:id, versionNumber:versionNumber1})
        const version2=await DocumentVersion.findOne({documentID:id, versionNumber:versionNumber2})

        if(!version1||!version2)
        {
            res.status(404).json("Incorrect version number provided")
            return
        }

        res.status(200).json(diff.diffLines(version1.content||"", version2.content||""))
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to compare document versions"})
    }
}

module.exports={createDocument,getDocuments,updateDocument,deleteDocument,viewDocumentHistory,restorePreviousVersion,compareVersions}