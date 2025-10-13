const jwt=require('jsonwebtoken')

//this middleware verifies the access token
const authenticateToken=(req,res,next)=>{
    //JWT has 3 parts: headers, payload, signature
    //we receive from, Authorization: Bearer <token> in request
    const authHeader=req.headers['authorization']    
    //splits str into arr on seeing ' '. So [0]: Bearer and [1]: token
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
        // Add the decoded data from the token to req
        // This data (username and _id) is what we originally put inside the token using jwt.sign()
        req.user=user
        next()
    })
}

module.exports=authenticateToken