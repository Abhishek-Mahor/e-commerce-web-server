const Order = require('../models/order.model');
const Cart = require('../models/user.cart.model');
const Product = require('../models/product.model');
const Razorpay = require('razorpay');
const crypto = require('crypto');

async function placeOrder(req, res) {
  try {
    const userId = req.userId;
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }

    // 1. Fetch user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cannot place order: Cart is empty' });
    }

    // 2. Verify stock levels for all items
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) {
        return res.status(404).json({ message: 'One or more products in your cart no longer exist' });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ 
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}` 
        });
      }
    }

    // 3. Deduct stock and prepare order items snapshots
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.productId;
      
      // Deduct stock
      product.stock -= item.qty;
      await product.save();

      // Snapshot details
      const itemTotal = product.price * item.qty;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        size: item.size || 'Default',
        color: product.color
      });
    }

    // 4. Create new Order record
    const paymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Completed';
    const order = new Order({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      orderStatus: 'Pending',
      subtotal,
      shippingFee: 0,
      totalAmount: subtotal
    });

    await order.save();

    // 5. Clear user's cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order._id,
      order
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function getOrderById(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function getUserOrders(req, res) {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

async function createRazorpayOrder(req, res) {
  try {
    const userId = req.userId;
    
    // 1. Fetch user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cannot create payment order: Cart is empty' });
    }

    // 2. Verify stock levels for all items
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) {
        return res.status(404).json({ message: 'One or more products in your cart no longer exist' });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ 
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}` 
        });
      }
    }

    // 3. Calculate total amount
    let subtotal = 0;
    for (const item of cart.items) {
      const product = item.productId;
      subtotal += product.price * item.qty;
    }

    // Razorpay amount is in paise (INR * 100)
    const amountInPaise = Math.round(subtotal * 100);

    const razorpay = getRazorpayInstance();
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      order: razorpayOrder
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function verifyRazorpayPayment(req, res) {
  try {
    const userId = req.userId;
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      shippingAddress 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !shippingAddress) {
      return res.status(400).json({ message: 'Payment verification details and shipping address are required' });
    }

    // 1. Verify Razorpay signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed: Signature mismatch' });
    }

    // 2. Fetch user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cannot place order: Cart is empty' });
    }

    // 3. Double check stock levels
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) {
        return res.status(404).json({ message: 'One or more products in your cart no longer exist' });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ 
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}` 
        });
      }
    }

    // 4. Deduct stock and prepare order items snapshots
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.productId;
      
      // Deduct stock
      product.stock -= item.qty;
      await product.save();

      // Snapshot details
      const itemTotal = product.price * item.qty;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        size: item.size || 'Default',
        color: product.color
      });
    }

    // 5. Create new Order record with Completed payment status
    const order = new Order({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'Razorpay',
      paymentStatus: 'Completed',
      orderStatus: 'Pending',
      subtotal,
      shippingFee: 0,
      totalAmount: subtotal
    });

    await order.save();

    // 6. Clear user's cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: 'Payment verified and order placed successfully',
      orderId: order._id,
      order
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

module.exports = {
  placeOrder,
  getOrderById,
  getUserOrders,
  createRazorpayOrder,
  verifyRazorpayPayment
};
