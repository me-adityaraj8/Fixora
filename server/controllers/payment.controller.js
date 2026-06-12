import dotenv from 'dotenv';
dotenv.config();

import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/payment/create-order
// @access  Private (customer only)
export const createOrder = async (req, res) => {
  try {
    const {bookingId} = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({message: 'Booking not found'});
    }

    // Fallback logic: use price.final if available, otherwise use
    // price.estimated
    const chargeAmount = booking.price.final || booking.price.estimated;

    if (!chargeAmount) {
      return res.status(400).json(
          {message: 'No valid amount found for this booking'});
    }

    // Amount in paise (multiply rupees by 100)
    const amount = chargeAmount * 100;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
    });

    // Save payment record in DB
    const payment = await Payment.create({
      booking: bookingId,
      customer: req.user._id,
      amount: booking.price.final,
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      message: 'Order created',
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment._id,
    });
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

// @route   POST /api/payment/verify
// @access  Private (customer only)
export const verifyPayment = async (req, res) => {
  try {
    const {razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId} =
        req.body;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature =
        crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .toString('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({message: 'Payment verification failed'});
    }

    // Update payment record
    await Payment.findOneAndUpdate({razorpayOrderId}, {
      razorpayPaymentId,
      razorpaySignature,
      status: 'success',
    });

    // Update booking payment status
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
    });

    res.status(200).json({message: 'Payment verified successfully'});
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

// @route   GET /api/payment/booking/:bookingId
// @access  Private
export const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment
                        .findOne({
                          booking: req.params.bookingId,
                        })
                        .populate('booking');

    if (!payment) {
      return res.status(404).json({message: 'Payment not found'});
    }

    res.status(200).json({payment});
  } catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
  }
};