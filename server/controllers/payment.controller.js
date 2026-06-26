import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/booking.js";
// Initialize Razorpay (We will add real keys to your .env later)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykey",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret",
});

export const createOrder = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    if (!amount || !bookingId) {
      return res.status(400).json({ message: "Amount and Booking ID are required" });
    }

    const options = {
      amount: amount * 100, // Razorpay strictly calculates in paise (₹1 = 100 paise)
      currency: "INR",
      receipt: `receipt_${bookingId}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ message: "Failed to create order" });

    res.status(200).json(order);
  } catch (error) {
    console.error("🚨 PAYMENT_ORDER_CRASH:", error);
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Cryptographically verify the payment authenticity
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummysecret")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Math checks out. It's real money. Update the database!
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "paid" });
      return res.status(200).json({ message: "Payment verified successfully", success: true });
    } else {
      return res.status(400).json({ message: "Invalid payment signature!", success: false });
    }
  } catch (error) {
    console.error("🚨 PAYMENT_VERIFY_CRASH:", error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};
