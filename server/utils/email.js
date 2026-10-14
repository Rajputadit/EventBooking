const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOtpEmail = async (email, otp, type) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; background-color: #f4f7fb; border-radius: 12px;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; text-align: center;">
                        <h2 style="color: #2563eb;">Email Verification</h2>
                        <p style="color: #555; font-size: 15px;">
                            Use the verification code below to verify your email address.
                        </p>
                        <div style="background-color: #eff6ff; padding: 18px; margin: 25px 0; border-radius: 8px;">
                            <h1 style="color: #2563eb; letter-spacing: 8px; margin: 0; font-size: 32px;">
                                ${otp}
                            </h1>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            This OTP is valid for 5 minutes.
                        </p>
                        <p style="color: #888; font-size: 13px;">
                            If you didn't request this code, please ignore this email.
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                        <p style="color: #999; font-size: 12px;">
                            &copy; ${new Date().getFullYear()} EventBooking
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email} for ${type}`);
        return true;
    } catch (error) {
        console.error(`Error sending OTP email for ${type}:`, error.message);
        throw error;
    }
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Booking Confirmed: ${eventTitle}`,
            html: `
            <h2>Hi ${userName}!</h2>
            <p>Your booking for the event <strong>${eventTitle}</strong> is confirmed.</p>
            <p>Thank you for choosing EventBooking.</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully', userEmail);
        return true;
    } catch (error) {
        console.error('Error sending booking email:', error);
        throw error;
    }
};

module.exports = {
    sendOtpEmail,
    sendBookingEmail
};
