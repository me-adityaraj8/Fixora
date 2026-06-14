import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
      booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
      },
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      method: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'cash'],
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      razorpayOrderId: {
        type: String,
      },
      razorpayPaymentId: {
        type: String,
      },
      razorpaySignature: {
        type: String,
      },
      paidAt: {
        type: Date,
      },
    },
    {timestamps: true});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;