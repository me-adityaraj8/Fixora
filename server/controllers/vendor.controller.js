import dotenv from 'dotenv';
dotenv.config();

import Vendor from '../models/Vendor.js';
import User from '../models/User.js';

// @route   POST /api/vendor/register
// @access  Private (logged in user)
export const registerVendor = async (req, res) => {
  try {
    const {businessName, description, phone, address} = req.body;

    // Check if vendor profile already exists
    const existingVendor = await Vendor.findOne({user: req.user._id});
    if (existingVendor) {
      return res.status(400).json({message: 'Vendor profile already exists'});
    }

    // Update user role to vendor
    await User.findByIdAndUpdate(req.user._id, {role: 'vendor'});

    // Create vendor profile
    const vendor = await Vendor.create({
      user: req.user._id,
      businessName,
      description,
      phone,
      address,
    });

    res.status(201).json({
      message: 'Vendor registered successfully',
      vendor,
    });
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

// @route   GET /api/vendor/profile
// @access  Private (vendor only)
export const getVendorProfile = async (req, res) => {
  try {
    const vendor =
        await Vendor.findOne({user: req.user._id}).populate('services');

    if (!vendor) {
      return res.status(404).json({message: 'Vendor profile not found'});
    }

    res.status(200).json({vendor});
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};