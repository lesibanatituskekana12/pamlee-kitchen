const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  trackerId: {
    type: String,
    required: true,
    unique: true
  },
  userEmail: {
    type: String,
    required: true
  },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  fulfilment: {
    type: String,
    required: true
  },
  deliveryLocation: {
    type: String,
    default: 'N/A'
  },
  deliveryAddress: {
    type: String,
    default: 'N/A'
  },
  status: {
    type: String,
    default: 'placed'
  },
  timeline: [{
    date: String,
    status: String,
    message: String
  }],
  placedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
