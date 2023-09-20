const express = require('express');
const messageController=require('../Controller/messageController');
const {authHandler}=require('../middleware/authMiddlewalre');
const Router = express.Router();

Router.post('/sendMessage',authHandler,messageController.sendMessage);
Router.get('/:chatId',authHandler,messageController.fetchAllMessages);



module.exports = Router;