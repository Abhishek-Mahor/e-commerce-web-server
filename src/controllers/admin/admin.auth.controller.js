const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();





function adminlogin(req, res) {
  const adminemail = process.env.ADMIN_EMAIL;
  const adminpassword = process.env.ADMIN_PASSWORD; // should be hashed
  const adminpasscode = process.env.ADMIN_PASSCODE;

  const { email, passcode, password } = req.body;

  //  Require all three to match
  if (email === adminemail && password === adminpassword && passcode === adminpasscode) {
    // Generate JWT token
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET || "secretKey", { expiresIn: "1h" });

    console.log("Login successful");
    return res.json({ msg: "Login successful", token });
  } else {
    console.log("Something went wrong");
    return res.status(401).json({ msg: "Invalid credentials" });
  }
}






function adminlogout(req, res) {
  // For JWT, logout is handled on the client side by deleting the token.
  // Optionally, you can implement token blacklisting on the server side.
  return res.json({ msg: "Logout successful" });
  
}


module.exports = {
    adminlogin,
    adminlogout
}