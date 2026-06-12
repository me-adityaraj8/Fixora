import express from 'express';

import {createOrder, getPaymentByBooking, verifyPayment,} from '../controllers/payment.controller.js';
import {protect} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/booking/:bookingId', protect, getPaymentByBooking);

export default router;