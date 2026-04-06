const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/authMiddleware');

// Generate a random alphanumeric order ID
function generateOrderId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// @route   POST /api/orders
// @desc    Create a new order
router.post('/', async (req, res) => {
  try {
    const { name, phone, items, total, orderType, location, requestedTime } = req.body;

    const newOrder = new Order({
      name,
      phone,
      items,
      total,
      orderType,
      location,
      requestedTime,
      orderId: generateOrderId()
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (for Admin Dashboard)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/orders/:orderId/status
// @desc    Update order status
router.put('/:orderId/status', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Using string matching since orderId in schema is a custom alphanumeric string
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId }, 
      { status }, 
      { returnDocument: 'after' }
    );
    
    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/orders/:orderId
// @desc    Delete an order
router.delete('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const deletedOrder = await Order.findOneAndDelete({ orderId });
    if (!deletedOrder) return res.status(404).json({ error: 'Order not found' });
    
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
