const mongoose = require('mongoose');
const usermodel = require('../models/user.model');


async function addAddress(req,res) {
    try {
        const {address,city,state,zipCode,phone} = req.body;
        if(!address || !city || !state || !zipCode || !phone){
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await usermodel.findById(req.userId);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        user.address = {address,city,state,zipCode,phone};
        await user.save();
        res.status(200).json({ message: 'Address added successfully', address: user.address });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

async function getAddress(req, res) {
    try {
        const user = await usermodel.findById(req.userId);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ address: user.address || null });
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}


module.exports = {
    addAddress,
    getAddress
};