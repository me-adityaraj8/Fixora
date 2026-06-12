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
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'refunded'],
        default: 'pending',
      },
      method: {
        type: String,
        enum: ['razorpay', 'cash', 'upi'],
        default: 'razorpay',
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
    },
    {timestamps: true});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;