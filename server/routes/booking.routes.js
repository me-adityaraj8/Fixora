import express from 'express';

import {createBooking, getMyBookings, getVendorBookings, updateBookingStatus,} from '../controllers/booking.controller.js';
import {protect} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/vendor-bookings', protect, getVendorBookings);
router.patch('/:id/status', protect, updateBookingStatus);

export default router;