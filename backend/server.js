// server.js - Complete Authentication Backend (MERN Stack)

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto'); // Built-in Node.js module for tokens

// Load environment variables (e.g., MONGO_URI, JWT_SECRET)
dotenv.config();

// ------------------------------------
// 1. SETUP EXPRESS APP & MIDDLEWARE
// ------------------------------------
const app = express();
const PORT = process.env.PORT || 5000;

// IMPORTANT: Ensure you have a strong secret key in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_please_change';

// Enable CORS: This is crucial to allow the frontend (port 8080) to talk to the backend (port 5000)
app.use(cors({
    // MUST match your frontend's port
    origin: 'http://localhost:8080',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// Body parser middleware: Allows us to read JSON data sent in the request body
app.use(express.json());

// ------------------------------------
// 2. MONGODB CONNECTION
// ------------------------------------
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthchef_auth';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));


// ------------------------------------
// 3. USER MODEL
// ------------------------------------
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Ensures password hash is not returned on basic queries
    },
    // Fields for Password Reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-Save Middleware: HASH PASSWORD BEFORE SAVING
UserSchema.pre('save', async function (next) {
    // Only hash if the password field has been modified (new user or password reset)
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to generate a password reset token (for email)
UserSchema.methods.getResetPasswordToken = function () {
    // Generate a secure, random token (raw bytes)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token and save it to the database (for security comparison later)
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set token expiration time (e.g., 10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // Return the UNHASHED token to be sent in the email link
    return resetToken;
};

const User = mongoose.model('User', UserSchema);


// ------------------------------------
// JWT Token Generator Function
// ------------------------------------
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};


// ------------------------------------
// 4. AUTH ROUTES - SIGNUP
// ------------------------------------
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please enter all required fields.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        user = await User.create({ name, email, password });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful! You are now logged in.',
            token,
            data: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error('Signup error:', error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ success: false, message: `Validation Error: ${messages.join(', ')}` });
        }
        res.status(500).json({ success: false, message: 'A server error occurred during registration.' });
    }
});


// ------------------------------------
// 5. AUTH ROUTES - LOGIN
// ------------------------------------
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    try {
        // Find user by email, explicitly select the password hash
        const user = await User.findOne({ email }).select('+password');

        // Check if user exists and password matches
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id);

            res.json({
                success: true,
                message: 'Login successful!',
                token,
                data: { id: user._id, name: user.name, email: user.email }
            });
        } else {
            // Failure: User not found or password mismatch
            res.status(401).json({ success: false, message: 'Invalid credentials (email or password incorrect).' });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'A server error occurred during login.' });
    }
});


// ------------------------------------
// 6. AUTH ROUTES - FORGOT PASSWORD (MOCK EMAIL)
// ------------------------------------

// @route   POST /api/auth/forgotpassword
// @desc    Send password reset link (MOCK EMAIL)
// @access  Public
app.post('/api/auth/forgotpassword', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // Send 200 OK even if user is not found to prevent timing attacks/enumeration
            return res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }

        // Generate and set the token on the user object (hashed)
        const resetToken = user.getResetPasswordToken();

        // Save the user with the new hashed token and expiration date
        await user.save({ validateBeforeSave: false }); // Bypass validation for password fields

        // Create the reset URL (using the unhashed token)
        const resetURL = `http://localhost:8080/resetpassword/${resetToken}`;

        // --- MOCK EMAIL LOGIC ---
        console.log('----------------------------------------------------');
        console.log(`MOCK EMAIL SENT to: ${user.email}`);
        console.log(`MOCK Reset URL (Use this link in your browser!): ${resetURL}`);
        console.log('----------------------------------------------------');
        // --- END MOCK EMAIL LOGIC ---

        res.status(200).json({
            success: true,
            message: 'Reset link processed. Check backend console for URL.',
        });

    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({ success: false, message: 'A server error occurred.' });
    }
});


// ------------------------------------
// 7. AUTH ROUTES - RESET PASSWORD
// ------------------------------------

// @route   PUT /api/auth/resetpassword/:resetToken
// @desc    Reset password using the token received via email
// @access  Public
app.put('/api/auth/resetpassword/:resetToken', async (req, res) => {
    const { resetToken } = req.params;
    
    // --- FIX STEP 1 ---
    // Make sure you are destructuring 'newPassword' from the request body.
    const { newPassword } = req.body; 

    // Add this console log for debugging
    console.log('Request Body:', req.body);
    console.log('New Password Received:', newPassword);


    // Hash the incoming URL token for comparison with the database
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    try {
        // Find user by the HASHED token and check that the token is not expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
        }
        
        // Basic validation check
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Please provide a password of at least 6 characters.' });
        }

        // --- FIX STEP 2 ---
        // Make sure you are assigning the 'newPassword' variable here.
        user.password = newPassword; 
        
        // Clear the token fields after successful reset
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save(); // The 'pre.save' middleware will automatically hash the new password

        // Optionally, re-issue a new login token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Password successfully reset. You are now logged in.',
            token
        });

    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({ success: false, message: 'A server error occurred during password reset.' });
    }
});


// ------------------------------------
// 8. START SERVER
// ------------------------------------
app.listen(PORT, () => console.log(`🚀 Server running in development mode on http://localhost:${PORT}`));