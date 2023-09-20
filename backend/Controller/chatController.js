const expressAsyncHandler = require('express-async-handler');
const chatModel = require('../Models/chatModel');
const userModel=require('../Models/userModel');

module.exports = {
    accessChat : expressAsyncHandler(async(req,res) => {
        const {userId} = req.body;
        if(!userId){
            res.status(404).json({
                status:'error',
                message:'userid is not valid'
            })
        }else{
            let isChat = await chatModel.find({
                isGroupChat:false,
                $and:[
                    {users:{$elemMatch :{$eq:userId}}},
                    {users:{$elemMatch :{$eq:req.user._id}}}
                ]
            }).populate('users','-pwd').populate('latestMessage');
            //getting latest mssage sender data
            isChat = await userModel.populate(isChat,{
                path:"latestMessage.sender",
                select:"name pic email"
            });
            if(isChat.length>0){
                res.status(200).json({
                    status:'success',
                    chat: isChat[0]
                })
            }else{
                let chatData = {
                    isGroupChat:false,
                    users:[req.user._id,userId],
                    chatName:'sender'
                };
                try {
                    const chat = await chatModel.create(chatData);
                    const finalChat = await chatModel.findOne({_id:chat._id}).populate('users','-pwd')
                    res.status(200).json({
                        status:'success',
                        finalChat
                    })
                } catch (error) {
                    console.log(error)
                    res.status(400).json({
                        status:'error',
                        message:error.message
                    })
                }
            }
        }
    }),

    fetchChats: expressAsyncHandler(async(req,res)=>{
        try {
         await chatModel.find({users:{$elemMatch:{$eq:req.user._id}}}).populate('users','-pwd').populate('groupAdmin','-pwd').populate('latestMessage').sort({createdAt:-1}).then(async(result)=>{
            result = await userModel.populate(result,{
                path:"latestMessage.sender",
                select:"name pic email"
            });
            res.status(200).json({
                status:'success',
                result
            })
         });
            
        } catch (error) {
            console.log(error.message)
            res.status(400).json({
                status:'error',
            })
        }

    }),

    createGroupChat: expressAsyncHandler(async(req,res)=>{
        console.log(req.body)
        if(!req.body.users || !req.body.name){
            res.status(400).json({
                status:'error',
                message:'please fill all the fields'
            })
        }
        let users = req.body.users;
        if(users.length<2){
            res.status(400).json({
                status:'error',
                message:'Thoda or add kar de re baba'
            })
        };
        users.push(req.user._id);
        try {
           const grp =  await chatModel.create({
            chatName:req.body.name,
                users:users,
                isGroupChat:true,
                groupAdmin:req.user
            });

            const grpChat = await chatModel.findOne({_id: grp._id}).populate('users','-pwd').populate('groupAdmin','-pwd');
            console.log(grpChat)
            res.status(200).json({
                status:'success',
                message:'group created',
                data:grpChat
            })
            
        } catch (error) {
            console.log(error);
            res.status(400).json({
                status:'error',
                message:error.message
            })
        }
    }),

    updateGroup:expressAsyncHandler(async(req,res)=>{
        if(req.body.addUser){
            const {chatId,userId} = req.body;
            const add =   await chatModel.findByIdAndUpdate(
                chatId,
                {
                    $push:{users:userId}
                },
                {
                    new:true
                }
            ).populate('users','-pwd').populate('groupAdmin','-pwd');
            if(add){
                return res.status(200).json({
                    status:'success',
                    message:'user added.',
                    add
                })
            }else{
                return res.status(400).json({
                    status:'error',
                    message:'user not found.'
                })
            }
        }
        else if(req.body.removeuser){
            const {chatId,userId} = req.body;
           const remove =  await chatModel.update(
                chatId,
                { $pull: { 'users': userId } }
              );
              if(remove){
                return res.status(200).json({
                    status:'success',
                    message:'user removed.',
                })
              }else{
                res.status(400).json({
                    status:'error',
                    message:'user not found.'
                })
              }
        }
        else if(req.body.updateGroupName){
            const {gName,chatId} = req.body;
         const updatedGroup = await chatModel.findByIdAndUpdate(
                chatId,
                {
                    'chatName':gName
                },
                {
                    new:true
                }
            ).populate('users','-pwd').populate('groupAdmin','-pwd');
          if(updatedGroup){
            return res.status(200).json({
                status:'success',
                message:'group name updated.',
                data:updatedGroup
            })
          }else{
            res.status(400).json({
                status:'error',
                message:'chat not found.'
            })
          }
        }
        else if(req.body.deleteGroup){
            const {chatId} = req.body;
            const deleteGroup = await chatModel.deleteOne(chatId);
            if(deleteGroup){
                return res.status(200).json({
                    status:'success',
                    message:'group deleted.',
                })
            }else{
                res.status(400).json({
                    status:'error',
                    message:'group not found.'
                })
            }
            
        }else{
          return res.status(400).json({
                status:'success',
                message:'group not found',
            })
        }
    })
}