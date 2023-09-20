const expressAsyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const genrateToken=require("../Config/genrateToken");
module.exports = {
  registerUser: expressAsyncHandler(async (req, res) => {
    const { name, email, pwd, pic } = req.body;
    if (!name || !email || !pwd) {
      res.status(400).json({
        status: "error",
        message: "Please enter all the fileds",
      });
    } else {
      const userExist = await User.findOne({ email });
      if (userExist) {
        res.status(400).json({
          status: "error",
          message: "user already exist",
        });
      } else {
        const user = await User.create({
          name,
          email,
          pwd,
          pic,
        });
        if (user) {
            const token = genrateToken(user._id)
          res.status(201).json({
            status: "success",
            message: "user created",
            user,
            token
          });
        } else {
          res.status(400).json({
            status: "error",
            message: "Failed to create user.",
          });
        }
      }
    }
  }),

  loginUser: expressAsyncHandler(async(req,res)=>{
    const {email,pwd} = req.body;
    const user = await User.findOne({email});
    try {
      if(user && (await user.matchPwd(pwd))){
        res.status(201).json({
            status:'success',
            message:'login successfully.',
            user,
            token: genrateToken(user._id),
        })
    }else{
        res.status(400).json({
            status:'error',
            message:'wrong email or password.'
        })
    }
    } catch (error) {
      console.log('error',error)
      let msg = error.message?error.message:'wrong email or password.'
      res.status(400).json({
        status:'error',
        message:msg
    })
    }

  }),

  getAllUsers:expressAsyncHandler(async(req,res)=>{
    let userQuery = req.query.search?{
      $or:[
       { 'email':{$regex:req.query.search,$options:'i'}},
       {'name':{$regex:req.query.search,$options:'i'}},
      ]
    }:{};
    const user = await User.find(userQuery).find({_id:{$ne:req.user._id}});
    res.status(200).json({
      message:'users data',
      user
    })
  })
};
