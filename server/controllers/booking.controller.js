import dotenv from 'dotenv';
dotenv.config();

import Booking from '../models/Booking.js';
import Vendor from '../models/Vendor.js';

// @route   POST /api/booking/create
// @access  Private (customer only)
export const createBooking = async (req, res) => {
  try {
    const {vendorId, serviceId, bookingType, address, scheduledAt, notes} =
        req.body;

    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({message: 'Vendor not found'});
    }

    const booking = await Booking.create({
      customer: req.user._id,
      vendor: vendorId,
      service: serviceId,
      bookingType,
      address,
      scheduledAt,
      notes,
      statusHistory: [{status: 'pending', note: 'Booking created'}],
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

// @route   GET /api/booking/my-bookings
// @access  Private (customer only)
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({customer: req.user._id})
                         .populate('vendor', 'businessName phone rating')
                         .populate('service', 'name category basePrice')
                         .sort({createdAt: -1});

    res.status(200).json({bookings});
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

// @route   GET /api/booking/vendor-bookings
// @access  Private (vendor only)
export const getVendorBookings = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({user: req.user._id});
    if (!vendor) {
      return res.status(404).json({message: 'Vendor profile not found'});
    }

    const bookings = await Booking.find({vendor: vendor._id})
                         .populate('customer', 'name email phone')
                         .populate('service', 'name category basePrice')
                         .sort({createdAt: -1});

    res.status(200).json({bookings});
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

// @route   PATCH /api/booking/:id/status
// @access  Private (vendor only)
export const updateBookingStatus = async (req, res) => {
  try {
    const {status, note} = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({message: 'Booking not found'});
    }

    booking.status = status;
    booking.statusHistory.push({status, note});

    if (status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    res.status(200).json({
      message: 'Booking status updated',
      booking,
    });
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};