const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageModel = new Schema({

    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    content:{
        type:String,
        trim:true
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Chats'
    }

},
{
    timestamps:true
})
module.exports = mongoose.model('message', messageModel);