
const OTP = require("../models/OTP.js");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const { sendOtpEmail } = require("../utils/email.js");

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email and password are required"
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                error: "User already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user"
        });

        // Generate a 6-digit OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Save OTP with its purpose and expiry
        await OTP.create({
            email,
            otp,
            action: "account_verification",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        // Send OTP email
        await sendOtpEmail(
            email,
            otp,
            "signup"
        );

        return res.status(201).json({
            message: "Registration successful. Please check your email for the verification OTP.",
            email: user.email
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            error: "Registration failed. Please try again."
        });
    }
};



//Login user

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check account verification if your schema supports it
        if (user.isVerified === false) {
            return res.status(403).json({
                message: "Please verify your email before logging in"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};