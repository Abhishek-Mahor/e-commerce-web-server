const Product = require("../models/product.model")




async function getAllProducts (req, res) {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
    

module.exports = {
    getAllProducts, 
} 