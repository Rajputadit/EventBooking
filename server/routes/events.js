const express=require('express');
const router=express.Router();
const {protect,admin}=require('../middleware/auth.js');
const {getAllEvents,getEventById,createEvent,updateEvent,deleteEvent}=require('../controllers/eventController.js')


//get All Events
router.get('/',getAllEvents);

//Get  Event by Id
router.get('/:id', getEventById);

//Create Event by Admin Only
router.post('/',protect,admin,createEvent);

//Upadte Event (Admin Only)
router.put('/:id',protect,admin,updateEvent);

//Delete Event (Admin Only)
router.delete('/:id', protect,admin,deleteEvent);


module.exports=router;