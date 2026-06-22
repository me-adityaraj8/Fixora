import express from "express";
import { registerVendor, getVendorProfile, getAllVendors } from "../controllers/vendor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/register", protect, registerVendor);
router.get("/profile", protect, getVendorProfile);
router.get("/all", getAllVendors);

export default router;
