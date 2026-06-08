import express from 'express';
import {register, login} from '../controllers/auth.controller.js';
import {protect} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, (req, res) => {
  res.json({user: req.user});
});

export default router;