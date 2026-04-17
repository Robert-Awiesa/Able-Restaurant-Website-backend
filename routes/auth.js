const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/auth/login
// @desc    Authenticate admin and get token
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Please enter a password' });
  }

  // Compare with the env variable admin password
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid Credentials' });
  }

  // Payload for JWT, we just need a boolean flag or a hardcoded ID
  const payload = {
    user: {
      role: 'admin'
    }
  };

  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '12h' },
    (err, token) => {
      if (err) throw err;
      res.json({ token });
    }
  );
});

// @route   GET /api/auth/verify
// @desc    Verify if the token is still valid
// @access  Private
router.get('/verify', auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
