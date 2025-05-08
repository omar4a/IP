const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true }
      }
    ],
    total: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    discountCode: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);