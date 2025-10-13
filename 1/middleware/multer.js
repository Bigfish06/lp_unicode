const multer=require('multer')
const fs=require('fs')
const path=require('path')

// user uploads file from their device
// we store it locally in our uploads folder
// then we upload it to cloud storage (cloudinary)
// clean up local storage

// use the uploads folder one level above current directory
const uploadDir=path.join(__dirname,'../uploads')
// if uploads doesn't exist, just create it
// recursive: true -> create missing parent folders also
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage=multer.diskStorage({
    // tells multer to save uploads in the uploadDir folder
    destination: function(req,file,cb){
        cb(null,uploadDir)
    },
    // specifies how to give each file a unique name
    filename: function(req,file,cb){
        const uniqueSuffix=Date.now()+'-'+Math.round(Math.random()*1e9)
        cb(null,file.fieldname+'-'+uniqueSuffix+path.extname(file.originalname))
    }
})

// we tell multer to use the settings we just defined
const upload=multer({storage:storage})

module.exports=upload