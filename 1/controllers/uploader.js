const upload=require('../middleware/multer')
const cloudinary=require('cloudinary').v2
const fs=require('fs')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const uploadOnCloudinary=async(localFilePath)=>{
    try {
        //check if local file path is valid
        if(!localFilePath)
        {
            return null
        }

        //upload file from local storage to server
        const file=await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        return file
    } catch (error) {        
        throw error
    } finally{
        // remove it from local
        if(!fs.existsSync(localFilePath))fs.unlinkSync(localFilePath)
    }
}

module.exports=uploadOnCloudinary