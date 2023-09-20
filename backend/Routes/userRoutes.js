const express = require('express');
const userController=require('../Controller/userController');
const {authHandler}=require('../middleware/authMiddlewalre');
const Router = express.Router();

Router.post('/register',userController.registerUser);
Router.post('/login',userController.loginUser);
Router.get('/getAll',authHandler,userController.getAllUsers);

module.exports = Router;