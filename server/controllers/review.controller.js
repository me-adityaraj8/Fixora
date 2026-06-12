import dotenv from 'dotenv';
dotenv.config();

import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Vendor from '../models/Vendor.js';

// @route   POST /api/review/create
// @access  Private (customer only)
export const createReview = async (req, res) => {
  try {
    const {bookingId, rating, comment} = req.body;

    // Check if booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({message: 'Booking not found'});
    }
    if (booking.status !== 'completed') {
      return res.status(400).json(
          {message: 'Can only review completed bookings'});
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      booking: bookingId,
      customer: req.user._id,
    });
    if (existingReview) {
      return res.status(400).json(
          {message: 'You have already reviewed this booking'});
    }

    // Create review
    const review = await Review.create({
      booking: bookingId,
      customer: req.user._id,
      vendor: booking.vendor,
      rating,
      comment,
    });

    // Update vendor rating
    const allReviews = await Review.find({vendor: booking.vendor});
    const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Vendor.findByIdAndUpdate(booking.vendor, {
      rating: avgRating.toFixed(1),
      totalReviews: allReviews.length,
    });

    res.status(201).json({
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

// @route   GET /api/review/vendor/:vendorId
// @access  Public
export const getVendorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({vendor: req.params.vendorId})
                        .populate('customer', 'name')
                        .sort({createdAt: -1});

    res.status(200).json({reviews});
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};