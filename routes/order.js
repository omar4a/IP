const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const auth = require('../middlewares/auth');

// Helper function to calculate shipping and tax (flat rates for demo purposes)
function calculateShippingAndTax(cart) {
  const shipping = 10; // flat shipping rate
  const taxRate = 0.1; // 10% tax rate
  let subtotal = 0;
  cart.items.forEach((item) => {
    if (item.product && item.product.price) {
      subtotal += item.product.price * item.quantity;
    }
  });
  const tax = subtotal * taxRate;
  return { shipping, tax, subtotal };
}

// GET /api/orders - retrieve orders for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('products.product');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/checkout - complete the checkout process
router.post('/checkout', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, discountCode } = req.body;
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const { shipping, tax, subtotal } = calculateShippingAndTax(cart);
    let total = subtotal + shipping + tax;
    // TODO: Apply discount logic if a valid discountCode is provided

    const order = new Order({
      user: req.user.id,
      products: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      total,
      shippingAddress,
      paymentMethod,
      discountCode
    });
    await order.save();
    // Clear the user's cart after successful order placement.
    cart.items = [];
    await cart.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:orderId - update the status of an order (for example, by an admin)
router.put('/:orderId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;