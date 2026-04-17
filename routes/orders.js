const express  = require('express');
const router   = express.Router();
const Order    = require('../models/Order');
const auth     = require('../middleware/authMiddleware');
const connectDB = require('../lib/mongoose');

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
    const { name, phone, items, total, orderType, location, requestedTime, orderId } = req.body;

    if (!name || !phone || !items || !total || !orderType || !requestedTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required order fields. Please check name, phone, and items.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Your cart is empty!' });
    }

    if (orderType === 'delivery' && !location) {
      return res.status(400).json({
        success: false,
        error: 'Delivery location is required for delivery orders.',
      });
    }

    const newOrder = new Order({
      name,
      phone,
      items,
      total,
      orderType,
      location: location || (orderType === 'dine-in' ? 'Table Order' : 'Store Pickup'),
      requestedTime,
      orderId: orderId || generateOrderId(),
    });

    const savedOrder = await newOrder.save();
    console.log(`Order created successfully: ${savedOrder.orderId}`);

    res.status(201).json({
      success: true,
      orderId: savedOrder.orderId,
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
  }
});

// @route   GET /api/orders/check/:orderId
// @desc    Verify if an order exists (used for frontend optimistic success check)
router.get('/check/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderExists = await Order.findOne({ orderId }).select('_id');
    if (orderExists) {
      return res.status(200).json({ found: true });
    }
    res.status(404).json({ found: false });
  } catch (err) {
    res.status(500).json({ error: 'Check failed' });
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
    const { status }  = req.body;

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