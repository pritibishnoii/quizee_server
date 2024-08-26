const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();


const errorHandler = (res, error) => {
  console.error(error);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (name.trim().length === 0) {
      return res.status(400).json({ error: "Name cannot be empty" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Weak password, Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id, user: user.email }, process.env.JWT_SECRET_KEY);
  
    res.json({
      success: true,
      token,
      userId: user._id,
      user: { email: user.email, name: user.name}
    });
  } catch (error) {
    errorHandler(res, error);
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "User is not registered" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid Password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);

    res.json({ success: true, token,  userId: user._id, name: user.name, user: email });
  } catch (error) {
    errorHandler(res, error);
  }
});

module.exports = router;
  

