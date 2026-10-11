const express=require('express');
const router=express.Router();
const {registerUser,loginUser, verifyOtp}=require('../controllers/authControllers.js')

//Register User
router.post('/register',registerUser);

//Login User
router.post('/login',loginUser);

//Verification
router.post('/verify-otp',verifyOtp);

module.exports=router;