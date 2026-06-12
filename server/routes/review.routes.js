import express from 'express';

import {createReview, getVendorReviews} from '../controllers/review.controller.js';
import {protect} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', protect, createReview);
router.get('/vendor/:vendorId', getVendorReviews);

export default router;