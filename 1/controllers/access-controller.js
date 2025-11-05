const Document=require('../models/document-model')
const {Resend}=require('resend')
const User = require('../models/user-model')
const resend=new Resend(process.env.RESEND_API_KEY)

const requestAccess=async(req,res)=>{
    try {
        const {id}=req.params
        const type=req.body.type
        //user attached to req by our middleware
        // but as it was lightweight, we fetch name email and only other things that we'll use and were excluded
        //console.log(req.user)
        const user = await User.findById(req.user._id).select("name email username")
        
        // see how we push another object to requests array
        const updatedDocument=await (Document.findByIdAndUpdate(id, {
            $push: {requests:{user: user._id, type:type}}
        },{new:true})

        // When a user requests access, 'createdBy' only stores the owner's ObjectId.
        // We use populate() to fetch the owner's full details (like name and email) and it gets attached inside createdBy
        // from the User collection using that ObjectId reference.
        .populate("createdBy", "name email"))

        if(!updatedDocument)
        {
            return res.status(404).json("Document to which you requested access was not found")
        }
        else
        {
            // successful
            // email notification to the owner
            await requestAccessEmailer(user, updatedDocument,type)
            //console.log(updatedDocument)
            //console.log(user)
        }

        res.status(200).json({message: "Requested access ",updatedDocument})
    } catch (error) {
        res.status(500).json({data: error.message, message: "Failed to request access"})
    }
}

const requestAccessEmailer=async(requestingUser,document,type)=>{
    const r=await resend.emails.send({
    from: process.env.WEBSITE_EMAIL,
    to: document.createdBy.email,
    subject: `Someone wants to view your document`,
    html: 
    `<p>
    ${requestingUser.name} (username: ${requestingUser.username}) has requested ${type} access to your document: ${document.title}. 
    To contact them, here's their email ${requestingUser.email}.
    </p>`
    });
    console.log(r)
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