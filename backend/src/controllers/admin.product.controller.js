const Product = require("../models/product.model");
const mongoose = require("mongoose");

async function addproduct (req,res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'Database not connected' });
    }
    const {name, price, stock, image, description, size, color} = req.body;
    const product = await Product.create({name, price, stock, image, description, size, color});
    res.status(201).json({message: "Product added successfully", product});      
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function updateproduct(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'Database not connected' });
    }
    const { id } = req.params;
    const { name, price, stock, image, description, size, color } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (image !== undefined) product.image = image;
    if (description !== undefined) product.description = description;
    if (size !== undefined) product.size = size;
    if (color !== undefined) product.color = color;

    await product.save();
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function deleteproduct(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'Database not connected' });
    }
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully', id });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

module.exports = {
  addproduct,
  updateproduct,
  deleteproduct
}