const express=require('express')
const router=express.Router()

const {createUser,getUserById,getAllUsers,updateUserEntirely,updateUserPartially,deleteUser}=require('../controllers/user-controller')
const {register,login,showProfile,refresh,deleteRefreshTokens}=require('../controllers/authenticator')
const authenticate=require('../middleware/authenticator')

const {createDocument,getDocuments,updateDocument,deleteDocument}=require('../controllers/document-controller')
const documentAuthorizor=require('../middleware/documentAuthorizor')

const uploader=require('../middleware/multer')
const uploadProfileIcon=require('../controllers/cloudinary-controller')
// note
router.post('/upload-profile-icon',authenticate,uploader.single('profileIcon'),uploadProfileIcon)

const {requestAccess,addUserAccess,approveRequest}=require('../controllers/access-controller')
router.post('/request-access/:id',authenticate,requestAccess)
router.post('/add-user-access/:id',authenticate,addUserAccess)
router.post('/approve-request/:id',authenticate,approveRequest)

const {viewDocumentHistory,restorePreviousVersion,compareVersions}=require('../controllers/document-controller')
const {exportPDF}=require('../controllers/pdf-export')


// keep static routes before dynamic routes
// here, /document before /:id

// document
router.post('/document',authenticate,createDocument)
// middleware
router.get('/document',authenticate,getDocuments)
router.patch('/document/:id',authenticate,documentAuthorizor,updateDocument)
router.delete('/document/:id',authenticate,documentAuthorizor,deleteDocument)

router.post('/',createUser)
router.get('/:id',getUserById)
router.get('/',getAllUsers)
router.put('/:id',updateUserEntirely)
router.patch('/:id',updateUserPartially)
router.delete('/:id',deleteUser)


router.post('/register',register)
router.post('/login',login)
router.get('/profile',authenticate,showProfile)

router.post('/token',refresh)
router.delete('/logout/:refreshToken',deleteRefreshTokens)

router.get('/view-history/:id',authenticate,viewDocumentHistory)
router.patch('/restore-history/:id/:versionNumber',authenticate,documentAuthorizor,restorePreviousVersion)
router.get('/compare-history/:id/:versionNumber1/:versionNumber2',authenticate,compareVersions)

router.get('/export-document/:id',authenticate,exportPDF)

module.exports=router