const Booking = require('../models/Booking.js');
const OTP = require('../models/OTP.js');
const Event = require('../models/Events.js');
const { sendOtpEmail, sendBookingEmail } = require('../utils/email.js');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOTPEmail = async (req, res) => {
    try {
        const otp = generateOtp();
        const email = req.user.email;

        await OTP.deleteMany({ email, action: 'event_booking' });
        await OTP.create({
            email,
            otp,
            action: 'event_booking',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        await sendOtpEmail(email, otp, 'event_booking');
        return res.json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error('sendOTPEmail error:', error);
        return res.status(500).json({ error: 'Failed to send OTP' });
    }
};

exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        if (!eventId || !otp) {
            return res.status(400).json({ error: 'Event ID and OTP are required' });
        }

        const otpRecord = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const OTPs = await OTP.find({ email: req.user.email, action: 'event_booking' }).sort({ createdAt: -1 });
        if (OTPs.length > 0) {
            await OTP.deleteMany({ email: req.user.email, action: 'event_booking' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.availableSeats <= 0) {
            return res.status(400).json({ error: 'No seat available' });
        }

        const existingBooking = await Booking.findOne({ userId: req.user._id, eventId });
        if (existingBooking) {
            return res.status(400).json({ error: 'You have already booked this event' });
        }

        await Booking.create({
            userId: req.user._id,
            eventId,
            status: 'pending',
            paymentStatus: 'non_paid',
            amount: event.ticketPrice
        });

        await OTP.deleteMany({ email: req.user.email, action: 'event_booking' });
        return res.status(201).json({
            message: 'Booking created. Please check your email for confirmation.',
            bookingId: undefined
        });
    } catch (error) {
        console.error('bookEvent error:', error);
        return res.status(500).json({ error: 'Booking failed' });
    }
};

exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        if (!['paid', 'non_paid'].includes(paymentStatus)) {
            return res.status(400).json({ error: 'Invalid payment status' });
        }

        const booking = await Booking.findById(req.params.id).populate('eventId');
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status === 'confirmed') {
            return res.status(400).json({ error: 'Booking is already confirmed' });
        }

        const event = await Event.findById(booking.eventId._id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.availableSeats <= 0) {
            return res.status(400).json({ error: 'No seat available' });
        }

        booking.status = 'confirmed';
        booking.paymentStatus = paymentStatus;
        await booking.save();

        event.availableSeats = Math.max(0, event.availableSeats - 1);
        await event.save();

        try {
            await sendBookingEmail(req.user.email, req.user.name || 'User', event.title);
        } catch (emailError) {
            console.warn('Booking confirmation email delivery failed:', emailError.message);
        }
        return res.json({ message: 'Booking confirmed' });
    } catch (error) {
        console.error('confirmBooking error:', error);
        return res.status(500).json({ error: 'Confirmation failed' });
    }
};

exports.getBookings = async (req, res) => {
    const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const booking = await Booking.find(query).populate('eventId').populate('userId', 'name email');
    return res.json(booking);
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('eventId');
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const isOwner = booking.userId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (booking.status === 'confirmed') {
            const event = await Event.findById(booking.eventId._id);
            if (event) {
                event.availableSeats = Math.min(event.totalSeat, event.availableSeats + 1);
                await event.save();
            }
        }

        booking.status = 'cancelled';
        await booking.save();

        return res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('cancelBooking error:', error);
        return res.status(500).json({ error: 'Cancellation failed' });
    }
};