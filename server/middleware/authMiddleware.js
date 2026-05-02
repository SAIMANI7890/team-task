const jwt = require("jsonwebtoken");

const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500);
      throw new Error("JWT_SECRET is required in environment");
    }

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    req.user = user;
    return next();
  } catch (err) {
    // If token is invalid/expired, treat as 401
    if (
      err &&
      (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
    ) {
      res.status(401);
      return next(new Error("Not authorized, token failed"));
    }

    return next(err);
  }
}

module.exports = { protect };
