const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  // Extract data from request body
  const { email, password, name, postCode, address } = req.body;

  try {
    // Hash password for security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user instance
    const user = new User({
      email,
      password: hashedPassword,
      name,
      postCode,
      address,
    });

    // Save the user to the database
    const result = await user.save();

    // Respond with success message and the user ID
    res.status(201).json({ userId: result._id, message: "User created!" });
  } catch (error) {
    // Handle errors (like duplicate email)
    res.status(500).json({ message: "Error creating user" });
  }
};

exports.login = async (req, res) => {
  // Extract login credentials from request body
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Respond with the user ID (Session management not included)
    res.status(200).json({ userId: user._id });
  } catch (error) {
    // Handle potential errors
    res.status(500).json({ message: "Error logging in" });
  }
};2

exports.forgotPassword = async (req, res) => {
  // Extract login credentials from request body
  const { email, newPassword, confirmPassword } = req.body;

  try {
    if (newPassword !== confirmPassword)
      return res
        .status(400)
        .json({ message: "Password and confirm password does not match" });

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const updateUser = await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    // Respond with the user ID (Session management not included)
    res.status(200).json({ message: "Password Changed Sucessfully" });
  } catch (error) {
    // Handle potential errors
    res.status(500).json({ message: "Error logging in" });
  }
};
