const Cart = require('../models/user.cart.model');
const Product = require('../models/product.model');

// Helper to format cart response
async function formatCart(cart) {
  if (!cart) {
    return { items: [], subtotal: 0, total: 0 };
  }

  // Populate products
  const populatedCart = await cart.populate('items.productId');

  let subtotal = 0;
  const items = populatedCart.items.filter(item => item.productId).map(item => {
    const prod = item.productId;
    const itemTotal = prod.price * item.qty;
    subtotal += itemTotal;
    
    return {
      productId: prod._id,
      productName: prod.name,
      price: prod.price,
      productColor: prod.color,
      image: prod.image,
      quantity: item.qty,
      size: item.size || 'Default'
    };
  });

  return {
    items,
    subtotal,
    total: subtotal
  };
}

async function getCart(req, res) {
  try {
    const userId = req.userId;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    const formatted = await formatCart(cart);
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function addToCart(req, res) {
  try {
    const userId = req.userId;
    const { productId, quantity, size } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const qty = parseInt(quantity) || 1;
    const itemSize = size || 'Default';

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart with same size
    const existingIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && (item.size || 'Default') === itemSize
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].qty += qty;
    } else {
      cart.items.push({ productId, qty, size: itemSize });
    }

    await cart.save();
    const formatted = await formatCart(cart);
    res.status(200).json({ message: 'Product added to cart', cart: formatted });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function updateCartItemQuantity(req, res) {
  try {
    const userId = req.userId;
    const { productId, quantity, size } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const qty = parseInt(quantity);
    const itemSize = size || 'Default';

    if (isNaN(qty)) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const existingIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && (item.size || 'Default') === itemSize
    );

    if (existingIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    if (qty <= 0) {
      cart.items.splice(existingIndex, 1);
    } else {
      cart.items[existingIndex].qty = qty;
    }

    await cart.save();
    const formatted = await formatCart(cart);
    res.status(200).json({ message: 'Cart updated', cart: formatted });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function removeCartItem(req, res) {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { size } = req.query;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Filter out items
    cart.items = cart.items.filter(item => {
      const matchProduct = item.productId.toString() === productId;
      const matchSize = size ? (item.size || 'Default') === size : true;
      return !(matchProduct && matchSize);
    });

    await cart.save();
    const formatted = await formatCart(cart);
    res.status(200).json({ message: 'Item removed from cart', cart: formatted });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem
};
