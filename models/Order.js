const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
    }
  ],
  total: { type: Number, required: true },
  orderType: { type: String, enum: ['delivery', 'pickup', 'dine-in'], required: true },
  location: { type: String },
  requestedTime: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed'], default: 'pending' },
  orderId: { type: String, required: true, unique: true } // Unique alphanumeric order ID
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);
