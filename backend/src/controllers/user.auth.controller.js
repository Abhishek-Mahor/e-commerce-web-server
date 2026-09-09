const mongoose = require('mongoose');
const usermodel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


async function  signup(req, res) {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ message: 'Database not connected' });
        }
        const { name: fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const isUserExist = await usermodel.findOne({ email });
        if(isUserExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await usermodel.create({
            fullname,
            email,
            password: hashedPassword
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

        res.cookie('token', token);

        res.status(201).json({
             message: 'User registered successfully',
             id: newUser._id,
             email: newUser.email,
             fullname: newUser.fullname,
             token: token
         });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

async function signin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await usermodel.findOne({ email });

        if(!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.cookie('token', token);
        res.status(200).json({
            message: 'User logged in successfully',
            id: user._id,
            email: user.email,
            fullname: user.fullname,
            token: token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

async function logout(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'User logged out successfully' });
}





module.exports = {
    signup,
    signin,
    logout
};