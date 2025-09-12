const express=require('express')
const router=express.Router()

const {register,login,showProfile,refresh,deleteRefreshTokens}=require('../controllers/controller')
const authenticate=require('../middleware/authenticator')
router.post('/register',register)
router.post('/login',login)
router.get('/profile',authenticate,showProfile)
router.post('/token',refresh)
router.delete('/logout',deleteRefreshTokens)

module.exports=router