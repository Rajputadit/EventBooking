
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    otp: {
        type: String,
        required: true
    },

    action: {
        type: String,
        enum: [
            "account_verification",
            "booking_confirmation",
            "event_booking",
            "forgot_password"
        ],
        required: true
    },

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null
    },

    expiresAt: {
        type: Date,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Automatically delete expired OTP documents
otpSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("OTP", otpSchema);
