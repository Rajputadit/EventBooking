const mongoose=require('mongoose');

const eventSchema=new mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    date:{
        type:Date,
        require:true
    },
    location:{
        type:String,
        require:true
    },
    category:{
        type:String,
        require:true
    },
    totalSeat:{
        type:Number,
        require:true
    },
    availableSeats:{
        type:Number,
        require:true
    },
    ticketPrice:{
        type:Number,
        require:true
    },
    imageUrl:{
        type:String,
        require:true
    },
    createBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        require:true
    }
},{timestamps:true});


module.exports=mongoose.model('Event',eventSchema);