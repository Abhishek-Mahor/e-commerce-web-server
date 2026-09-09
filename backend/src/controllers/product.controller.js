const express = require('express');
const mongoose = require('mongoose');
const product = require("../models/product.model");

// Add a new product
function addProduct(req, res) { 
    const { name,size,color, description, price ,stock} = req.body;


    if (!name || !size || !color || !description || !price || !stock) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const newProduct = new product({
        name,
        size,
        color,
        description,
        price,
        stock
    });

    newProduct.save()
        .then(product => {
            res.status(201).json({ message: 'Product added successfully', product });
        })
        .catch(err => {
            res.status(500).json({ message: 'Error adding product', error: err });
        });
}


// Get all products
function getAllProducts(req, res) {
    console.log('GET /api/products', 'readyState=', mongoose.connection.readyState);
    product.find()
        .then(products => {
            console.log('GET /api/products result count=', products.length);
            res.status(200).json(products);
        })
        .catch(err => {
            console.error('GET /api/products error', err);
            res.status(500).json({ message: 'Error fetching products', error: err });
        });
}

// Get product by ID
function getProductById(req, res) {
    product.findById(req.params.id)
        .then(product => {
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json(product);
        })
        .catch(err => {
            res.status(500).json({ message: 'Error fetching product', error: err });
        });
}

module.exports = {
    addProduct,
    getAllProducts,
    getProductById
};