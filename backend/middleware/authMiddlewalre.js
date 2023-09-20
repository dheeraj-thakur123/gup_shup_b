const expressAsyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const Jwt = require('jsonwebtoken');

const authHandler = expressAsyncHandler(async(req,res,next)=>{
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            token = req.headers.authorization.split(' ')[1];
            const decode = Jwt.verify(token,process.env.JWT_SECRET);
            req.user = await User.findById(decode.id).select('-pwd')
            next();
        } catch (error) {
            res.status(404).json({
                status:'error',
                message:'User not authorized'
            })
        }
    }else{
        res.status(404).json({
            status:'error',
            message:'User not authorized'
        })
    }
})

module.exports = {authHandler}