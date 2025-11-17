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
const PORT = process.env.PORT || 5003;

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


// ------------------------------------
// 12. "TODAY'S RECIPE" ROUTE (NEW)
// ------------------------------------

// @route   GET /api/recipes/today
// @desc    Generate a single, random recipe suggestion based on user profile
// @access  Private
// ------------------------------------
// INGREDIENT SUBSTITUTION ENDPOINT
// ------------------------------------
app.post("/api/recipes/substitutes", protect, async (req, res) => {
  const { ingredient } = req.body;

  if (!ingredient) {
    return res.status(400).json({
      success: false,
      message: "Please provide an ingredient.",
    });
  }

  const profile = req.user?.profile || {};
  const dietaryRestrictions = profile.dietaryRestrictions || [];

  const prompt = `
    You are HealthChef, an AI culinary assistant. A user wants substitutes for: "${ingredient}"

    User's dietary restrictions: ${dietaryRestrictions.join(", ") || "None"}

    Provide exactly 5 substitute ingredients that:
    1. Can replace "${ingredient}" in most recipes
    2. Do NOT violate the user's dietary restrictions
    3. Are commonly available

    Respond ONLY with a valid JSON object:
    {
      "original": "${ingredient}",
      "substitutes": [
        {
          "name": "Substitute ingredient name",
          "reason": "Brief reason why this works as a substitute",
          "ratio": "Substitution ratio (e.g., '1:1' or '2:1')"
        }
      ]
    }
  `;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a helpful culinary assistant that responds only in valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      response_format: { type: "json_object" },
    });

    const rawText = response.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(rawText);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("SUBSTITUTION ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate substitutes.",
    });
  }
});

// ------------------------------------
// MENU SCANNING / OCR ENDPOINT
// ------------------------------------
app.post("/api/menu/scan", protect, async (req, res) => {
  const { imageBase64, menuText } = req.body;

  if (!imageBase64 && !menuText) {
    return res.status(400).json({
      success: false,
      message: "Please provide menu image or text.",
    });
  }

  const profile = req.user?.profile || {};
  const dietaryRestrictions = profile.dietaryRestrictions || [];

  // If text is provided directly (from client-side OCR or manual input)
  const textToAnalyze = menuText || "No text provided - using image analysis";

  const prompt = `
    You are HealthChef, an AI menu analyzer. Analyze this restaurant menu text and provide:
    1. List of identified dishes
    2. Key ingredients found
    3. Substitution suggestions based on user restrictions
    4. Recipe recommendations

    User's dietary restrictions: ${dietaryRestrictions.join(", ") || "None"}
    Health conditions: ${profile.healthConditions?.join(", ") || "None"}

    Menu Text:
    ${textToAnalyze}

    Respond ONLY with valid JSON:
    {
      "dishes": [
        {
          "name": "Dish name",
          "description": "Brief description",
          "suitability": "safe" | "caution" | "avoid",
          "reason": "Why this rating"
        }
      ],
      "ingredients": ["list", "of", "key", "ingredients"],
      "substitutions": [
        {
          "original": "Problematic ingredient",
          "substitute": "Safe alternative",
          "reason": "Why to substitute"
        }
      ],
      "recommendations": [
        {
          "dish": "Recommended dish name",
          "modification": "How to order it safely"
        }
      ]
    }
  `;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a health-conscious menu analyzer that responds only in valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const rawText = response.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(rawText);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("MENU SCAN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to analyze menu.",
    });
  }
});

// ------------------------------------
// SKILL-BASED RECIPE GENERATION
// ------------------------------------
app.post("/api/recipes/generate-advanced", protect, async (req, res) => {
  const { ingredients, skillLevel = "intermediate" } = req.body;

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide at least one ingredient.",
    });
  }

  const profile = req.user?.profile || {};
  const dietaryRestrictions = profile.dietaryRestrictions || [];
  const healthConditions = profile.healthConditions || [];
  const spicePreference = profile.spicePreference || "medium";
  const cuisineTypes = profile.cuisineTypes || [];
  const timeAvailability = profile.timeAvailability || "30-min";

  // Filter blocked ingredients
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
      success: true,
      recipe: null,
      message: `All ingredients conflict with dietary restrictions. Blocked: ${blockedIngredients.join(", ")}`,
    });
  }

  // Skill level descriptions
  const skillDescriptions = {
    beginner: "Simple steps, basic techniques only, minimal equipment, no advanced skills required. Use common ingredients and straightforward methods like boiling, frying, or baking. Include exact timings and visual cues.",
    intermediate: "Moderate complexity, some technique required, standard kitchen equipment. Can include sautéing, roasting, making sauces, and layering flavors. Assume basic cooking knowledge.",
    advanced: "Complex techniques, professional methods, may require specialized equipment. Include advanced skills like emulsification, reduction, tempering, or sous vide. Focus on technique and precision."
  };

  const prompt = `
    Generate a structured recipe in JSON format based on the following:

    USER PROFILE:
    - Dietary Restrictions: ${dietaryRestrictions.join(", ") || "None"}
    - Health Conditions: ${healthConditions.join(", ") || "None"}
    - Spice Preference: ${spicePreference}
    - Preferred Cuisines: ${cuisineTypes.join(", ") || "Any"}
    - Available Time: ${timeAvailability}

    SKILL LEVEL: ${skillLevel.toUpperCase()}
    ${skillDescriptions[skillLevel] || skillDescriptions.intermediate}

    INGREDIENTS TO USE: ${safeIngredients.join(", ")}
    BLOCKED INGREDIENTS: ${blockedIngredients.join(", ") || "None"}

    Respond ONLY with valid JSON:
    {
      "title": "Creative recipe title",
      "description": "Enticing 2-3 sentence description",
      "difficulty": "${skillLevel}",
      "prepTime": "X minutes",
      "cookTime": "X minutes",
      "totalTime": "X minutes",
      "servings": "X servings",
      "ingredients": [
        {
          "item": "Ingredient name",
          "amount": "Quantity",
          "unit": "unit of measurement",
          "notes": "optional preparation notes"
        }
      ],
      "steps": [
        {
          "number": 1,
          "instruction": "Detailed step instruction",
          "time": "Time for this step",
          "tip": "Optional helpful tip"
        }
      ],
      "nutrition": {
        "calories": "Approximate calories per serving",
        "protein": "Xg",
        "carbs": "Xg",
        "fat": "Xg"
      },
      "tips": ["Array of helpful cooking tips"],
      "substitutes": [
        {
          "original": "Original ingredient",
          "alternatives": ["Alternative 1", "Alternative 2"]
        }
      ]
    }
  `;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are HealthChef, a world-class recipe generator that responds only in valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawText = response.choices?.[0]?.message?.content || "{}";
    const recipe = JSON.parse(rawText);

    res.json({
      success: true,
      recipe,
      blockedIngredients,
    });
  } catch (err) {
    console.error("ADVANCED RECIPE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate recipe.",
    });
  }
});

app.get("/api/recipes/today", protect, async (req, res) => {
  try {
    // Get the user's profile from the authenticated user
    const profile = req.user?.profile || {};
    const userName = req.user?.name || 'there';

    // --- Construct the prompt for a complete recipe of the day ---
    const prompt = `
      You are HealthChef, an AI assistant that provides a complete "Recipe of the Day" with full details.
      A user named "${userName}" needs today's recipe. Generate ONE complete recipe that fits their profile:
      - Dietary Restrictions: ${profile.dietaryRestrictions?.join(", ") || "None"}
      - Health Conditions: ${profile.healthConditions?.join(", ") || "None"}
      - Preferred Cuisines: ${profile.cuisineTypes?.join(", ") || "Any"}
      - Available Cooking Time: ${profile.timeAvailability || "any"}

      Provide a COMPLETE recipe with all details needed to cook it.

      Respond ONLY with a valid JSON object. Do not include any other text, explanations, or markdown. The JSON object MUST have this exact structure:
      {
        "title": "A creative and appealing recipe title",
        "description": "A very short, one-sentence enticing description of the dish.",
        "time": "A string representing the estimated cooking time (e.g., '25 minutes')",
        "badges": [
          "A relevant badge based on the recipe (e.g., 'Vegan', 'Keto', 'Low-Carb')",
          "A second relevant badge (e.g., 'Heart Healthy', 'Quick Meal', 'Spicy')"
        ],
        "ingredients": [
          "1 cup ingredient with measurement",
          "2 tbsp another ingredient"
        ],
        "steps": [
          "First step instruction",
          "Second step instruction",
          "Continue with remaining steps"
        ],
        "nutrition": {
          "calories": "Estimated calories per serving (e.g., '320 kcal')",
          "protein": "Protein content (e.g., '18g')",
          "carbs": "Carbohydrates (e.g., '35g')",
          "fat": "Fat content (e.g., '12g')"
        },
        "tips": [
          "A helpful cooking tip or variation",
          "Another useful suggestion"
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
        ingredients: [
          "1 baguette, sliced into 1/2-inch rounds",
          "4 ripe tomatoes, diced",
          "1/4 cup fresh basil leaves, chopped",
          "2 cloves garlic, minced",
          "3 tbsp extra virgin olive oil",
          "1 tbsp balsamic vinegar",
          "Salt and pepper to taste"
        ],
        steps: [
          "Preheat your oven to 400°F (200°C).",
          "Arrange baguette slices on a baking sheet and brush with olive oil. Toast for 8-10 minutes until golden.",
          "In a bowl, combine diced tomatoes, basil, garlic, remaining olive oil, and balsamic vinegar.",
          "Season with salt and pepper to taste.",
          "Spoon the tomato mixture onto toasted bread slices.",
          "Serve immediately and enjoy!"
        ],
        nutrition: {
          calories: "180 kcal",
          protein: "4g",
          carbs: "24g",
          fat: "8g"
        },
        tips: [
          "Use the ripest tomatoes you can find for the best flavor.",
          "Add a drizzle of balsamic glaze for extra sweetness."
        ]
      }
    });
  }
});


// ------------------------------------
// 8. START SERVER (EXISTING)
// ------------------------------------
app.listen(PORT, () => console.log(`🚀 Server running in development mode on http://localhost:${PORT}`));
