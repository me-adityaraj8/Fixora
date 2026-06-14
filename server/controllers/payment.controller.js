import dotenv from 'dotenv';
dotenv.config();

import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

// @route   POST /api/payment/create
// @access  Private (customer only)
export const createPayment = async (req, res) => {
  try {
    const {bookingId, amount, method} = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({message: 'Booking not found'});
    }

    const payment = await Payment.create({
      booking: bookingId,
      customer: req.user._id,
      vendor: booking.vendor,
      amount,
      method,
      status: 'paid',  // simulating success for now
      paidAt: new Date(),
    });

    // Update booking payment status
    booking.paymentStatus = 'paid';
    booking.price.final = amount;
    await booking.save();

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment,
    });
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

// @route   GET /api/payment/booking/:bookingId
// @access  Private
export const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({booking: req.params.bookingId});

    if (!payment) {
      return res.status(404).json({message: 'Payment not found'});
    }

    res.status(200).json({payment});
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};