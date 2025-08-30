const express=require('express')
const router=express.Router()

const {createUser,getUserById,getAllUsers,updateUserEntirely,updateUserPartially,deleteUser}=require('../controllers/controller')
router.post('/',createUser)
router.get('/:id',getUserById)
router.get('/',getAllUsers)
router.put('/:id',updateUserEntirely)
router.patch('/:id',updateUserPartially)
router.delete('/:id',deleteUser)

module.exports=router