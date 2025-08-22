import userModel from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UserController {
  // ==============================
  //  User Registration
  // ==============================
  static userRegistration = async (req, res) => {
    try {
      const { name, email, password, confirm_password } = req.body;

      // Validate input
      if (!name || !email || !password || !confirm_password) {
        return res.status(400).json({
          status: "failed",
          message: "All fields are required",
        });
      }

      if (password !== confirm_password) {
        return res.status(400).json({
          status: "failed",
          message: "Password and Confirm Password do not match",
        });
      }

      // Check existing user
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: "failed",
          message: "User email already exists",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
      });

      return res.status(201).json({
        status: "success",
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
      });
    }
  };

  // ==============================
  //  User Login
  // ==============================
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: "failed",
          message: "Email and password are required",
        });
      }

      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(400).json({
          status: "failed",
          message: "User not registered",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid email or password",
        });
      }

      // Generate JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return res.status(200).json({
        status: "success",
        message: "User logged in successfully",
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "failed",
        message: "Unable to login",
      });
    }
  };

  // ==============================
  //  Change Password
  // ==============================
  static changePassword = async (req, res) => {
    try {
      const { password, confirm_password } = req.body;

      if (!password || !confirm_password) {
        return res.status(400).json({
          status: "failed",
          message: "All fields are required",
        });
      }

      if (password !== confirm_password) {
        return res.status(400).json({
          status: "failed",
          message: "Password and Confirm Password do not match",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const newHashedPassword = await bcrypt.hash(password, salt);

      await userModel.findByIdAndUpdate(req.user._id, {
        password: newHashedPassword,
      });

      return res.status(200).json({
        status: "success",
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "failed",
        message: "Unable to change password",
      });
    }
  };

  // ==============================
  //  Get Logged User
  // ==============================
  static Loggeduser = async (req, res) => {
    try {
      return res.status(200).json({ status: "success", user: req.user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
      });
    }
  };

  // ==============================
  //  Send Password Reset Email
  // ==============================
  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    try {
      if (!email) {
        return res.status(400).json({ message: "Email field is required" });
      }

      const user = await userModel.findOne({ email: email });
      if (!user) {
        return res.status(404).json({ message: "Email does not exist" });
      }

      const secret = user._id + process.env.JWT_SECRET;
      const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1h" });

      const link = `http://127.0.0.1:3000/users/reset/${user._id}/${token}`;

      // Just log the link
      console.log("Password reset link:", link);

      res.status(200).json({
        status: "success",
        message: "Password reset link generated. Check your console.",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ status: "failed", message: "Something went wrong" });
    }
  };

  // ========================
  //  Password Reset
  // ========================

  static userPasswordReset = async (req, res) => {
    const { password, confirm_password } = req.body;
    const { id, token } = req.params;
    const user = await userModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET;
    try {
      jwt.verify(token, new_secret);
      if (password && confirm_password) {
        if (password !== confirm_password) {
          res.send({
            status: "failed",
            message: "New Password and Confirm Password does not Match",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const resetNewHashedPassword = await bcrypt.hash(password, salt);
          await userModel.findByIdAndUpdate(user._id, {
            $set: { password: resetNewHashedPassword },
          });
          res.send({
            status: "success",
            message: "Password Reset Successfully....",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (err) {}
  };
}

export default UserController;
