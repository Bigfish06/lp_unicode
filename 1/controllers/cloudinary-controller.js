const uploadOnCloudinary=require('./uploader')
const User=require('../models/user-model')

const uploadProfileIcon=async(req,res)=>{
    try {
        if(!req.file)
        {
            return res.status(404).json("No file uploaded")
        }
        const id=req.user._id
        const localFilePath=req.file.path   //file given by multer

        const uploadResult=await uploadOnCloudinary(localFilePath)

        const user=await User.findByIdAndUpdate(
            id, {profileIcon:uploadResult.secure_url},
            {new:true}
        )

        res.status(200).json({message: "Successfully uploaded profile icon",
            profileIcon: user.profileIcon
        })
    } catch (error) {
        res.status(500).json({data:error.message,message:"Failed to upload profile icon"})
    }
}

module.exports=uploadProfileIcon