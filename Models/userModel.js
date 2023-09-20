const mongoose = require('mongoose');
const bcrypt = require ('bcryptjs')
const Schema = mongoose.Schema;

const userModel = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    }, 
    pwd:{
        type:String,
        required:true
    },
    pic:{
        type:String,
        // default:'https://picsum.photos/id/237/200/300'
    }

}, {
    timestamps:true
});
//comparing password
userModel.methods.matchPwd = async function(pwd){
    return await bcrypt.compare(pwd,this.pwd)
};
//encrypting password
userModel.pre('save',async function(next){
    if(!this.isModified){
        next()
    }
    const salt = await bcrypt.genSalt(10);
    this.pwd = await bcrypt.hash(this.pwd,salt);
})
module.exports = mongoose.model('User', userModel);