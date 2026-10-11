const mongoose=require('mongoose');
const { create } = require('./User');

const otpSchema=new mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    opt:{
        type:String,
        require:true
    },
    action:{
        type:String,
        enum:['account_verification','event_booking'],
        require:true
    },
    createAt:{
        type:Date,
        default:Date.now,
        expires:200
    }
});


module.exports=mongoose.model('OTP', otpSchema);