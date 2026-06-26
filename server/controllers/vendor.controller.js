import dotenv from "dotenv";
dotenv.config();
import Vendor from "../models/Vendor.js";
import User from "../models/User.js";

export const registerVendor = async (req, res) => {
  try {
    const { businessName, description, phone, address } = req.body;
    const existingVendor = await Vendor.findOne({ user: req.user._id });
    if (existingVendor) return res.status(400).json({ message: "Vendor profile already exists" });
    
    await User.findByIdAndUpdate(req.user._id, { role: "vendor" });
    const vendor = await Vendor.create({ user: req.user._id, businessName, description, phone, address });
    
    res.status(201).json({ message: "Vendor registered successfully", vendor });
  } catch (error) {
    console.error('SERVER_CRASH_LOG:', typeof err !== 'undefined' ? err : typeof error !== 'undefined' ? error : 'Unhandled exception details'); res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id }).populate("services");
    if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });
    res.status(200).json({ vendor });
  } catch (error) {
    console.error('SERVER_CRASH_LOG:', typeof err !== 'undefined' ? err : typeof error !== 'undefined' ? error : 'Unhandled exception details'); res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isActive: true }).select("businessName _id rating");
    res.status(200).json({ vendors });
  } catch (error) {
    console.error('SERVER_CRASH_LOG:', typeof err !== 'undefined' ? err : typeof error !== 'undefined' ? error : 'Unhandled exception details'); res.status(500).json({ message: "Server error", error: error.message });
  }
};
