const express=require('express')
const router=express.Router()

const {createUser,getUserById,getAllUsers,updateUserEntirely,updateUserPartially,deleteUser}=require('../controllers/controller')
const {register,login,showProfile,refresh,deleteRefreshTokens}=require('../controllers/controller2')
const authenticate=require('../middleware/authenticator')
const {createDocument,getDocuments,updateDocument,deleteDocument}=require('../controllers/document-controller')
const documentAuthorizor=require('../middleware/documentAuthorizor')

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


//just fix access of these methods
router.post('/document',authenticate,createDocument)
router.get('/document',authenticate,documentAuthorizor,getDocuments)

router.patch('/document/:id',authenticate,documentAuthorizor,updateDocument)
router.delete('/document/:id',authenticate,documentAuthorizor,deleteDocument)

module.exports=router