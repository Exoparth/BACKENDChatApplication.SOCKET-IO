const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password: hashed });

        res.json({ success: true, user });
    } catch (error) {
        res.json({ error });
    }
};


exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).json({ error: "User not found" });

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return res.status(400).json({ error: "Wrong password" });

        // Generate token
        const token = jwt.sign({ id: user._id }, "secret123");

        // FIX → include token in response
        res.json({
            success: true,
            token,
            user
        });

    } catch (error) {
        res.json({ error });
    }
};

