const jwt=require('jsonwebtoken')

//middleware verifies the token
const authenticateToken=(req,res,next)=>{
    //JWT has 3 parts, headers, payload, signature
    //in req we receive, Authorization: Bearer <token>
    const authHeader=req.headers['authorization']    
    const token=authHeader&&authHeader.split(' ')[1]
    if(!token)
    {
        return res.status(404).json("No access(token not found)")
    }
    //verify if the token is valid, compare it with our secret
    //if there is an error during jwt.verify(), err object will be not null
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err)
        {
            //we see that you have a token, but is no longer valid
            return res.status(403).json("Token is invalid")
        }
        //attach decoded payload to req
        req.user=user
        next()
    })
}

module.exports=authenticateToken