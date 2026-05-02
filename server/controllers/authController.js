const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/User");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("JWT_SECRET is required in environment");
    err.statusCode = 500;
    throw err;
  }

  return jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: "7d",
  });
}

function toUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("name, email, and password are required");
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409);
      throw new Error("Email already in use");
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      // role intentionally not accepted from client
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: toUserResponse(user),
    });
  } catch (err) {
    // Handle Mongo duplicate key errors defensively
    if (err && err.code === 11000) {
      res.status(409);
      return next(new Error("Email already in use"));
    }
    return next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400);
      throw new Error("email and password are required");
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(
      String(password),
      user.password,
    );
    if (!passwordMatches) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const token = signToken(user);

    res.json({
      token,
      user: toUserResponse(user),
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { signup, login };
