// server.js - Complete Authentication Backend (MERN Stack)

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto'); // Built-in Node.js module for tokens
const Groq = require("groq-sdk");
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// Load environment variables (e.g., MONGO_URI, JWT_SECRET)


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
// 3. USER MODEL (UPDATED for Profile)
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

    // --- NEW PROFILE FIELDS ---
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    profile: {
        dietaryRestrictions: [String],
        healthConditions: [String],
        spicePreference: String,
        cuisineTypes: [String],
        timeAvailability: String,
    },
    // --------------------------

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




// 9. AUTHENTICATION MIDDLEWARE (NEW)
// ------------------------------------
const protect = async (req, res, next) => {
    let token;

    // Check if the Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header: split(' ')[1] separates "Bearer" from the actual token string
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get user from the token (excluding the password hash)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                // Fails if the JWT ID is valid but the user was deleted
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('Authentication Error:', error);
            // This is triggered if the token is invalid, expired, or malformed
            return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
        }
    }

    if (!token) {
        // This is triggered if the Authorization header is completely missing
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// ... (rest of server.js)



// ------------------------------------
// 4. AUTH ROUTES - SIGNUP (EXISTING)
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
            data: { id: user._id, name: user.name, email: user.email, isProfileComplete: user.isProfileComplete }
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
// 5. AUTH ROUTES - LOGIN (EXISTING)
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
                data: { id: user._id, name: user.name, email: user.email, isProfileComplete: user.isProfileComplete }
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
// 10. PROFILE & DATA ROUTES (NEW)
// ------------------------------------

// @route   PUT /api/profile
// @desc    Setup or update user cooking profile
// @access  Private
app.put('/api/profile', protect, async (req, res) => {
    const { dietaryRestrictions, healthConditions, spicePreference, cuisineTypes, timeAvailability } = req.body;

    const profileFields = {
        dietaryRestrictions: dietaryRestrictions || [],
        healthConditions: healthConditions || [],
        spicePreference: spicePreference || 'medium',
        cuisineTypes: cuisineTypes || [],
        timeAvailability: timeAvailability || '30-min',
    };

    try {
        const user = req.user; // User object attached by the 'protect' middleware

        // Update the profile sub-document
        user.profile = profileFields;
        user.isProfileComplete = true; // Mark profile as complete

        await user.save();
        
        // Return the updated user data (excluding sensitive fields)
        res.json({
            success: true,
            message: 'Profile updated successfully!',
            data: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                isProfileComplete: user.isProfileComplete,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ success: false, message: 'A server error occurred during profile update.' });
    }
});


// @route   GET /api/profile/me
// @desc    Get current authenticated user data for dashboard
// @access  Private
app.get('/api/profile/me', protect, async (req, res) => {
    try {
        // req.user contains the user data (minus password) from the protect middleware
        const user = req.user; 

        res.json({
            success: true,
            data: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                isProfileComplete: user.isProfileComplete,
                profile: user.profile // Include profile data if needed in the future
            }
        });

    } catch (error) {
        console.error('Fetch User Error:', error);
        res.status(500).json({ success: false, message: 'A server error occurred while fetching user data.' });
    }
});


// ------------------------------------
// 6. AUTH ROUTES - FORGOT PASSWORD (MOCK EMAIL) (EXISTING)
// ------------------------------------
app.post('/api/auth/forgotpassword', async (req, res) => {
    const { email } = req.body;
    // ... existing logic
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }

        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

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
// 7. AUTH ROUTES - RESET PASSWORD (EXISTING)
// ------------------------------------
app.put('/api/auth/resetpassword/:resetToken', async (req, res) => {
    const { resetToken } = req.params;
    
    const { newPassword } = req.body; 

    console.log('Request Body:', req.body);
    console.log('New Password Received:', newPassword);


    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
        }
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Please provide a password of at least 6 characters.' });
        }

        user.password = newPassword; 
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

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



// ... (rest of your server.js file)
// =================================================================
// Extracted Groq AI Recipe Generation Module
// =================================================================

// 1. Initialize the Groq AI Client


// 2. The Express Route for Recipe Generation
// server.js -> AI Recipe Generation Route

app.post("/api/recipes/generate", protect, async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide at least one ingredient.",
    });
  }

  // --- Step 1: Read the full user profile from the authenticated user ---
  const profile = req.user?.profile || {};
  const dietaryRestrictions = profile.dietaryRestrictions || [];
  const healthConditions = profile.healthConditions || [];
  const spicePreference = profile.spicePreference || "medium";
  const cuisineTypes = profile.cuisineTypes || [];
  const timeAvailability = profile.timeAvailability || "30-min";

  // --- Step 2: Perform Allergy Filtering based on profile ---
  let blockedIngredients = [];
  let safeIngredients = ingredients.filter((item) => {
    const lower = item.toLowerCase();
    if (dietaryRestrictions.includes("nut-free") && (lower.includes("nut") || lower.includes("almond") || lower.includes("peanut"))) {
      blockedIngredients.push(item);
      return false;
    }
    if (dietaryRestrictions.includes("dairy-free") && (lower.includes("milk") || lower.includes("cheese") || lower.includes("butter") || lower.includes("yogurt"))) {
      blockedIngredients.push(item);
      return false;
    }
    if (dietaryRestrictions.includes("gluten-free") && (lower.includes("wheat") || lower.includes("flour") || lower.includes("bread") || lower.includes("pasta"))) {
      blockedIngredients.push(item);
      return false;
    }
    return true;
  });

  if (safeIngredients.length === 0) {
    return res.json({
      success: true, // Send success: true so the frontend can display the custom message
      recipe: `All of your ingredients conflict with your profile's dietary restrictions. The following were blocked: ${blockedIngredients.join(", ")}`,
    });
  }

  // --- Step 3: Construct the detailed prompt for Groq AI ---
  const prompt = `
    Generate a personalized cooking recipe based on the details below. Make the tone fun, exciting, and encouraging.

    ==========================
    USER PROFILE
    ==========================
    - Dietary Restrictions: ${dietaryRestrictions.join(", ") || "None"}
    - Health Conditions: ${healthConditions.join(", ") || "None"}
    - Spice Preference: ${spicePreference}
    - Preferred Cuisines: ${cuisineTypes.join(", ") || "Any"}
    - Available Cooking Time: ${timeAvailability}

    Strictly Avoid these ingredients due to restrictions: ${dietaryRestrictions.join(", ")}
    The user provided these unsafe ingredients which have been blocked: ${blockedIngredients.join(", ") || "None"}

    You MUST use ONLY these safe ingredients provided by the user: ${safeIngredients.join(", ")}

    ==========================
    COOKING RULES
    ==========================
    - Adhere strictly to ALL dietary restrictions.
    - If vegan/vegetarian, ensure no animal products are used.
    - For Keto, focus on low-carb ingredients.
    - For Diabetes, ensure the recipe is low in sugar.
    - For Hypertension, ensure the recipe is low in sodium.
    - The recipe's total cook time must fit within the user's available time.
    - Keep the steps beginner-friendly and easy to follow.

    ==========================
    OUTPUT FORMAT (MANDATORY)
    ==========================
    Provide the recipe as a single, continuous block of text. The output MUST be structured exactly as follows:
    1. A creative "Recipe Title".
    2. A list of "Ingredients" with exact quantities.
    3. A list of "Step-by-step Instructions".
    4. A section titled "⭐ Ingredient Substitutes" which is very important. In this section, provide 1-2 safe substitutes for EACH of the primary safe ingredients. Ensure these substitutes do not violate any of the user's dietary restrictions.
  `;

  // --- Step 4: Make the request to the Groq API ---
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // A fast and capable model for this task
      messages: [
        { role: "system", content: "You are a world-class, personalized recipe generator named HealthChef." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const recipeText = response.choices?.[0]?.message?.content || "Sorry, I couldn't generate a recipe at this time.";

    res.json({
      success: true,
      recipe: recipeText, // Send the raw text back to the frontend
    });

  } catch (err) {
    console.error("🔥 GROQ AI ERROR:", err);
    res.status(500).json({
      success: false,
      message: "The AI recipe generator failed to respond. Please try again later.",
    });
  }
});

// server.js

// ... (your existing code, including the /api/recipes/generate route)

// ------------------------------------
// 12. "TODAY'S RECIPE" ROUTE (NEW)
// ------------------------------------

// @route   GET /api/recipes/today
// @desc    Generate a single, random recipe suggestion based on user profile
// @access  Private
app.get("/api/recipes/today", protect, async (req, res) => {
  try {
    // Get the user's profile from the authenticated user
    const profile = req.user?.profile || {};
    const userName = req.user?.name || 'there';

    // --- Construct the prompt for a single, simple recipe idea ---
    const prompt = `
      You are HealthChef, an AI assistant that provides a single, exciting "Recipe of the Day" suggestion.
      A user named "${userName}" needs a new idea. Generate ONE recipe that fits their profile:
      - Dietary Restrictions: ${profile.dietaryRestrictions?.join(", ") || "None"}
      - Health Conditions: ${profile.healthConditions?.join(", ") || "None"}
      - Preferred Cuisines: ${profile.cuisineTypes?.join(", ") || "Any"}
      - Available Cooking Time: ${profile.timeAvailability || "any"}

      The user is looking for inspiration, not a full recipe.

      Respond ONLY with a valid JSON object. Do not include any other text, explanations, or markdown. The JSON object MUST have this exact structure:
      {
        "title": "A creative and appealing recipe title",
        "description": "A very short, one-sentence enticing description of the dish.",
        "time": "A string representing the estimated cooking time (e.g., '25 minutes')",
        "badges": [
          "A relevant badge based on the recipe (e.g., 'Vegan', 'Keto', 'Low-Carb')",
          "A second relevant badge (e.g., 'Heart Healthy', 'Quick Meal', 'Spicy')"
        ]
      }
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a helpful recipe suggestion generator that always responds in perfect JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8, // Slightly higher temperature for more creative suggestions
      response_format: { type: "json_object" }, // Guarantee the output is valid JSON
    });

    const rawText = response.choices?.[0]?.message?.content || "{}";
    const recipeJSON = JSON.parse(rawText);

    res.json({ success: true, recipe: recipeJSON });

  } catch (err) {
    console.error("🔥 GROQ 'TODAY'S RECIPE' ERROR:", err);
    // Provide a safe fallback recipe if the AI fails
    res.status(500).json({
      success: false,
      message: "Failed to generate today's recipe.",
      recipe: {
        title: "Classic Tomato & Basil Bruschetta",
        description: "A quick and refreshing appetizer perfect for any occasion.",
        time: "15 minutes",
        badges: ["Vegetarian", "Quick Snack"],
      }
    });
  }
});


// ------------------------------------
// 8. START SERVER (EXISTING)
// ------------------------------------
app.listen(PORT, () => console.log(`🚀 Server running in development mode on http://localhost:${PORT}`));
