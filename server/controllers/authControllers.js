
const OTP = require("../models/OTP.js");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const { sendOtpEmail } = require("../utils/email.js");

const genrateToken=(id,role)=>{
    return jwt.sign({id,role}, process.env.jwt_SECRET, {expiresIn: '7d'});
}




//Register User
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

exports.loginUser= async (req,res)=>{
    const {email,password}=req.body;

    let user =await User.findOne({email});
    if(!user){
        return res.status(400).json({error:'Invalid credentials'});
    }

    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({error: 'Invalid credential'});
    }


    if(!user.isVerified){
        const otp= Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteMany({email, action:'account_verification'})

        await OTP.create({email,otp,action: 'account_verification'});
        await sendOtpEmail(email,otp, 'account_verfication');
        return res.status(400).json({
            error: 'Account not verified. A new OTP has been sent to your email.'
        });
    }


    res.json({
        message:'Login successful',
        _id: user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        token:genrateToken(user.id,user.role)
    })
};



//verify OTP

exports.verifyOtp=async (req,res)=>{
    const {email,otp}= req.body;
    const otpRecord= await OTP.findOne({email,otp,action: 'account_verification'});

    if(!otpRecord){
        return res.status(400).json({error: 'Invalid or expired OTP'})
    }


    const user= await User.findOneAndUpdate({email},{isVerified:true});
    await OTP.deleteMany({email,action:'account_verification'});
    res.json({
        message:'Account verified successfully. You can now log In',
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        token:genrateToken(user._id,user.role)
    });
};