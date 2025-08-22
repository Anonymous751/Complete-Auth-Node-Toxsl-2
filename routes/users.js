import express from "express";
import UserController from "../myapp/User/controller/user.controller.js";
import protect from "../myapp/User/middleware/protect.js";

const router = express.Router();

// Public Routes
router.post("/register", UserController.userRegistration);
router.post("/login", UserController.userLogin);
router.post("/send-reset-password-email", UserController.sendUserPasswordResetEmail);
router.post("/password-reset/:id/:token", UserController.userPasswordReset)
// Private Routes
router.post("/change-password", protect, UserController.changePassword);
router.get("/logged-user", protect, UserController.Loggeduser);

export default router;
