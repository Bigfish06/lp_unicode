const Document=require('../models/document-model')

const requestAccess=async(req,res)=>{
    try {
        const {id}=req.params
        const type=req.body.type
        //user attached to req by our middleware
        const user=req.user 
        
        // see how we push another object to requests array
        const updatedDocument=await Document.findByIdAndUpdate(id, {
            $push: {requests:{user: user._id, type:type}}
        },{new:true})
        if(!updatedDocument)
        {
            return res.status(404).json("Document to which you requested access was not found")
        }

        res.status(200).json({message: "Requested access ",updatedDocument})
    } catch (error) {
        res.status(500).json({data: error.message, message: "Failed to request access"})
    }
}

const approveRequest=async(req,res)=>{
    try {
        const {id}=req.params   //document 
        const userID=req.body.userID    //user who we want to approve
        
        const document=await Document.findById(id)
        if(!document)
        {
            return res.status(404).json("Document not found")
        }

        const request=document.requests.find(r=>r.user.equals(userID))
        if(!request)
        {
            return res.status(404).json("User request not found")
        }

        if(request.type==="view")
        {
            document.access.view.push(request.user)
        }
        else if(request.type==="edit")
        {
            document.access.edit.push(request.user)
        }

        request.status="approved"

        // this gets handy when we modify without awaits earlier, like here we use push
        await document.save()

        res.status(200).json({message: "Request was approved successfully ",document})
    } catch (error) {
        res.status(500).json({data: error.message, message: "Failed to approve request"})
    }
}

const addUserAccess=async(req,res)=>{
    try {
        const {id}=req.params   //document 
        const {userID,type}=req.body    //user who we want to add
        
        const document=await Document.findById(id)
        if(!document)
        {
            return res.status(404).json("Document not found")
        }

        if(type==="view")
        {
            document.access.view.push(userID)
        }
        else if(type==="edit")
        {
            document.access.edit.push(userID)
        }

        await document.save()
        res.status(200).json({message: "User was given access",document})
    } catch (error) {
        res.status(500).json({data: error.message, message: "Failed to give access"})
    }
}

module.exports={requestAccess,approveRequest,addUserAccess}