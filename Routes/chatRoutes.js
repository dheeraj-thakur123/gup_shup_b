const express = require('express');
const chatController=require('../Controller/chatController');
const {authHandler}=require('../middleware/authMiddlewalre');
const Router = express.Router();

Router.post('/acessChats',authHandler,chatController.accessChat)
Router.get('/getAll',authHandler,chatController.fetchChats)
Router.post('/groupChat',authHandler,chatController.createGroupChat)
// //Add remove updatee group
Router.put('/updateGroup',authHandler,chatController.updateGroup)


module.exports = Router;