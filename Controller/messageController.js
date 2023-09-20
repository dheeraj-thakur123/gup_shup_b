const expressAsyncHandler = require('express-async-handler');
const messageModel = require('../Models/messageModel');
const userModel=require('../Models/userModel');
const chatModel=require('../Models/chatModel');

module.exports = {
    sendMessage : expressAsyncHandler(async(req,res) => {
        try {
            console.log('callli')
            const {content,chatId} = req.body;
            if(!content || !chatId){
                res.status(400).json({
                    status:'error',
                    message:'Invalid request.'
                })
            }
            let newMessage = {
                sender:req.user._id,
                content,
                chat:chatId
            };
            let message = await messageModel.create(newMessage);
            message = await message.populate('sender','name pic');
            message = await message.populate('chat');
            message = await userModel.populate(message,{
                path:'chat.users',
                select:'name pic email'
            });
            await chatModel.findByIdAndUpdate(chatId,{
                latestMessage:message
            })
            res.status(200).json({
                status:'success',
                message
            })

            // if(message){
            //     res.status(200).json({
            //         status:'success',
            //         message:error.message
            //     })
            // }else{
            //     await messageModel.create(newMessage);
            //     res.status(200).json({
            //         status:'success',
            //         message:error.message
            //     })
            // }
            
        } catch (error) {
            console.log(error)
            res.status(400).json({
                status:'error',
                message:error.message
            })
        }
    }),

    fetchAllMessages: expressAsyncHandler(async(req,res)=>{
        try {
            const allMessages = await messageModel.find({chat:req.params.chatId}).populate('sender',"name pic email").populate('chat').sort({createdAt:1});
            res.status(200).json({
                status:'success',
                message:allMessages
            })
            
        } catch (error) {
            console.log(error)
            res.status(400).json({
                status:'error',
                message:error.message
            })
        }

    }),

  
}