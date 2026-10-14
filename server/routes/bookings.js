const express = require('express');
const router = express.Router();

const {
    bookEvent,
    sendOTPEmail,
    getBookings,
    confirmBooking,
    cancelBooking
} = require('../controllers/bookingController.js');

const { protect, admin } = require('../middleware/auth.js');

router.post('/', protect, bookEvent);
router.post('/send-otp', protect, sendOTPEmail);
router.get('/', protect, admin, getBookings);
router.get('/my', protect, getBookings);
router.put('/:id/confirm', protect, admin, confirmBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.delete('/:id', protect, cancelBooking);

module.exports = router;
