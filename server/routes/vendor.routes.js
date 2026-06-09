import express from 'express';

import {getVendorProfile, registerVendor} from '../controllers/vendor.controller.js';
import {authorizeRoles, protect} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', protect, registerVendor);
router.get('/profile', protect, getVendorProfile);

export default router;