import express from 'express';

import {createPayment, getPaymentByBooking} from '../controllers/payment.controller.js';
import {protect} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', protect, createPayment);
router.get('/booking/:bookingId', protect, getPaymentByBooking);

export default router;