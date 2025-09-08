const express=require('express')
const router=express.Router()

const {register,login}=require('../controllers/controller')
const {authenticate}=require('../middleware/authenticator')
router.post('/register',authenticate,register)
router.post('/login',login)

module.exports=router