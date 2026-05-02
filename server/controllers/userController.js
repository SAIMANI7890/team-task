const User = require("../models/User");

// GET /users - Get all users (for assignment dropdowns)
async function getUsers(req, res, next) {
  try {
    const users = await User.find()
      .select('name email role')
      .sort({ name: 1 });
    
    res.json(users);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getUsers };
