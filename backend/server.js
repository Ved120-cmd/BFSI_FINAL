const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

/* ===============================
   1. CONNECT TO MONGODB ATLAS
================================ */
require('dotenv').config();
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));


/* ===============================
   2. USER SCHEMA
================================ */
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);


/* ===============================
   3. SIGNUP ROUTE
================================ */
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ✅ FIX: ensure name is STRING
      let finalName;

if (typeof name === "string") {
    finalName = name;
} else {
    finalName = email.split('@')[0];
}

        // check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // ✅ HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: finalName,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: 'Signup successful!' });

    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ error: 'Server error during signup' });
    }
});


/* ===============================
   4. LOGIN ROUTE
================================ */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        // ❌ user not found
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // ✅ compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({
            message: 'Login successful!',
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: 'Server error during login' });
    }
});


/* ===============================
   5. START SERVER
================================ */
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});