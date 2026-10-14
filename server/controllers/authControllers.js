
const jwt = require('jsonwebtoken');
const OTP = require('../models/OTP.js');
const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const { sendOtpEmail } = require('../utils/email.js');

const genrateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required'
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const requestedRole = role === 'admin' ? 'admin' : 'user';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: requestedRole
        });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.create({
            email,
            otp,
            action: 'account_verification',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        try {
            await sendOtpEmail(email, otp, 'account_verification');
        } catch (emailError) {
            console.warn('Registration email delivery failed:', emailError.message);
        }

        return res.status(201).json({
            message: 'Registration successful. Please check your email for the verification OTP.',
            email: user.email,
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            message: 'Registration failed. Please try again.'
        });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credential' });
    }

    if (!user.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteMany({ email, action: 'account_verification' });
        await OTP.create({
            email,
            otp,
            action: 'account_verification',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        try {
            await sendOtpEmail(email, otp, 'account_verification');
        } catch (emailError) {
            console.warn('Login email delivery failed:', emailError.message);
        }
        return res.status(400).json({
            message: 'Account not verified. A new OTP has been sent to your email.',
            needsVerification: true,
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    }

    return res.json({
        message: 'Login successful',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: genrateToken(user.id, user.role)
    });
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp, action: 'account_verification' });

    if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    await OTP.deleteMany({ email, action: 'account_verification' });

    return res.json({
        message: 'Account verified successfully. You can now log in',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: genrateToken(user._id, user.role)
    });
};