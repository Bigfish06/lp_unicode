const Document=require('../models/document-model')

const authorizeDocument=async(req,res,next)=>{
    try {
        //as we are using one authorize method for multiple requests, 
        //we must know which requests called
        // we do so using req.method
        // if method type is same then we can use req.params or req.originalUrl
        const method=req.method

        // req.user was attached by our authenticator middleware
        const userId=req.user._id

        const {documentId}=req.params
        const document=await Document.findById(documentId)
        if(!document)
        {
            res.status(404).json("Document not found")
        }

        // see the use of some
        const isOwner=document.createdBy===userId
        const isEditor=document.access.edit.some(uID=>uID===userId)
        const isViewer=document.access.view.some(uID=>uID===userId)

        if(method==="PATCH")
        {
            //owner + editor
            if(!isOwner&&!isEditor)
            {
                return res.status(403).json("You don't have access to edit this document")
            }
        }
        else if(method==="DELETE")
        {
            //owner
            if(!isOwner)
            {
                return res.status(403).json("You don't have access to delete this document")
            }
        }
        else if(method==="GET")
        {
            //owner, editor, viewer
            if(!isOwner&&!isEditor&&!isViewer)
            {
                return res.status(403).json("You don't have access to view these documents")
            }
        }
        
        // we also attach the document to req for future use
        // so we won't need a find by id again in the controller
        req.document=document
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to authorize document"})
    }   

}

module.exports=authorizeDocument