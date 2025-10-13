const User=require('../models/user-model')

const createUser=async(req,res)=>{
    try {
        const user=req.body
        await User.create(user)
        res.status(201).json(user)
    } catch (error) {
        res.status(500).json({data:error.message,message:'Failed to create User'})
    }
}

const getUserById=async(req,res)=>{
    try {
        const {id}=req.params
        const user=await User.findById(id)
        if(!user)
        {
            res.status(404).json('No such user exists')
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({data:error.message,message:'Failed to fetch User'})
    }
}

const getAllUsers=async(req,res)=>{
    try {
        const allUsers=await User.find({})
        res.status(200).json(allUsers)
    } catch (error) {
        res.status(500).json({data:error.message,message:'Failed to fetch Users'})
    }
}

const updateUserEntirely=async(req,res)=>{
    try {
        const {id}=req.params
        const user=req.body
        const newUser=await User.findOneAndReplace({_id:id},user,{new :true})
        if(!newUser)
        {
            res.status(404).json('No such user found')
        }
        res.status(200).json(newUser)
    } catch (error) {
        res.status(500).json({data:error.message,message:'Failed to update user'})
    }
}

const updateUserPartially=async(req,res)=>{
    try {
        const {id}=req.params
        const user=req.body
        const newUser=await User.findByIdAndUpdate(id, user,{new :true})
        if(!newUser)
        {
            res.status(404).json('No such user found')
        }
        res.status(200).json(newUser)
    } catch (error) {
        res.status(500).json({data:error.message,message:'Failed to update user'})
    }
}

const deleteUser=async(req,res)=>{
    try {
        const {id}=req.params
        const deletedUser=await User.findByIdAndDelete(id)
        if(!deletedUser)
        {
            res.status(404).json('No such user found')
        }
        res.status(200).json('User was successfully deleted')
    } catch (error) {
        res.status(500).json({data:error.message,message:'Failed to delete user'})
    }
}

module.exports={createUser,getUserById,getAllUsers,updateUserPartially,updateUserEntirely,deleteUser}