const express = require('express');
const router  = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/authMiddleware');

// @desc    Submit a message
// @route   POST /api/messages
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const newMessage = await Message.create({ name, email, phone, subject, message });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to send message' });
  }
});

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// @desc    Update message status (e.g., mark as read)
// @route   PATCH /api/messages/:id
// @access  Private (Admin)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updatedMessage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update message' });
  }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
