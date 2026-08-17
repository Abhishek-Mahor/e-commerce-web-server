const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: {
        state: { type: String },
        city: { type: String },
        zipCode: { type: String },
        address: { type: String },
        phone: { type: String }
    }

}, 
   {
    timestamps: true
   }
);

 const usermodel = mongoose.model('User', userSchema);
 
 module.exports = usermodel;
